import { db } from "@/lib/db";

function tiraneDateKey(date=new Date()){
  return new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Tirane",year:"numeric",month:"2-digit",day:"2-digit"}).format(date);
}
function dayNumber(key){ return Math.floor(Date.parse(`${key}T12:00:00.000Z`)/86400000); }

export async function processCustomerVehicleDocumentReminders({now=new Date()}={}){
  const today=tiraneDateKey(now);
  const reminders=await db.customerVehicleReminder.findMany({
    where:{isActive:true,dueDate:{not:null},notificationSentAt:null,documentId:{not:null}},
    select:{id:true,title:true,dueDate:true,remindDaysBefore:true,documentId:true,customerVehicle:{select:{id:true,plate:true,profile:{select:{userId:true}}}}},
    take:1000,
  });
  let notified=0;
  for(const reminder of reminders){
    const due=tiraneDateKey(reminder.dueDate);
    const daysLeft=dayNumber(due)-dayNumber(today);
    if(daysLeft>reminder.remindDaysBefore) continue;
    await db.$transaction(async(tx)=>{
      const claimed=await tx.customerVehicleReminder.updateMany({where:{id:reminder.id,notificationSentAt:null,isActive:true},data:{notificationSentAt:now}});
      if(!claimed.count) return;
      const timing=daysLeft<0?`ka skaduar prej ${Math.abs(daysLeft)} ditësh`:daysLeft===0?"skadon sot":`skadon pas ${daysLeft} ditësh`;
      await tx.notification.create({data:{
        userId:reminder.customerVehicle.profile.userId,
        title:"Dokument automjeti pranë skadimit",
        message:`${reminder.title} për ${reminder.customerVehicle.plate} ${timing}.`,
        type:daysLeft<0?"ERROR":"WARNING",
        entityType:"DOCUMENT",
        entityId:`customer-vehicle:${reminder.customerVehicle.id}`,
      }});
      notified+=1;
    });
  }
  return {checked:reminders.length,notified};
}
