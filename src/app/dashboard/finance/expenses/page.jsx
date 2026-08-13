import { CalendarDays, CreditCard, FileText, Plus, ReceiptText, Store, Tags } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ExpenseRowActions from "@/components/finance/ExpenseRowActions";
import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { money } from "@/lib/finance-period";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { createExpenseAction } from "../actions";

const paymentLabels = {
  CASH: "Cash",
  BANK_TRANSFER: "Transfertë bankare",
  CARD: "Kartë",
  OTHER: "Tjetër",
};

function Field({ label, icon: Icon, children, className = "" }) {
  return (
    <label className={className}>
      <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        <Icon size={14} /> {label}
      </span>
      {children}
    </label>
  );
}

export default async function ExpensesPage() {
  const { businessId, business, businessRole } = await requireBusinessPermission(
    PERMISSIONS.FINANCE_VIEW,
  );
  const canManageFinance = hasPermission(
    businessRole,
    PERMISSIONS.FINANCE_MANAGE,
  );

  const [categories, expenses] = await Promise.all([
    db.expenseCategory.findMany({
      where: { businessId, isActive: true },
      orderBy: { name: "asc" },
    }),
    db.businessExpense.findMany({
      where: { businessId },
      include: { category: true },
      orderBy: { expenseDate: "desc" },
      take: 200,
    }),
  ]);

  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const thisMonth = new Date();
  const monthlyTotal = expenses
    .filter((expense) => {
      const date = new Date(expense.expenseDate);
  return (
        date.getFullYear() === thisMonth.getFullYear() &&
        date.getMonth() === thisMonth.getMonth()
      );
    })
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  const actionCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));
  const actionExpenses = Object.fromEntries(
    expenses.map((expense) => [
      expense.id,
      {
        id: expense.id,
        categoryId: expense.categoryId,
        description: expense.description,
        supplier: expense.supplier,
        documentNumber: expense.documentNumber,
        amount: Number(expense.amount),
        paymentMethod: expense.paymentMethod,
        expenseDate: new Date(expense.expenseDate).toISOString().slice(0, 10),
        notes: expense.notes,
      },
    ]),
  );


  return (
    <DashboardLayout>
      <div className="space-y-7">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Financa operative
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                Shpenzimet e biznesit
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Regjistro kostot, dokumentet dhe furnitorët për një pasqyrë të saktë financiare.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-[360px]">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-500">Gjithsej</p>
                <p className="mt-2 text-xl font-black text-slate-950">{money(total, business.currency)}</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs font-bold text-blue-600">Ky muaj</p>
                <p className="mt-2 text-xl font-black text-blue-950">{money(monthlyTotal, business.currency)}</p>
              </div>
            </div>
          </div>
        </header>

        {canManageFinance ? (
          <form action={createExpenseAction} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Plus size={20} /></div>
              <div><h2 className="font-black text-slate-950">Regjistro shpenzim</h2><p className="text-sm text-slate-500">Plotëso të dhënat kryesore të transaksionit.</p></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Përshkrimi" icon={FileText} className="xl:col-span-2"><input name="description" required placeholder="P.sh. Blerje pajisjesh zyre" className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></Field>
              <Field label="Shuma" icon={ReceiptText}><input name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00" className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></Field>
              <Field label="Data" icon={CalendarDays}><input name="expenseDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></Field>
              <Field label="Mënyra e pagesës" icon={CreditCard}><select name="paymentMethod" className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"><option value="CASH">Cash</option><option value="BANK_TRANSFER">Transfertë bankare</option><option value="CARD">Kartë</option><option value="OTHER">Tjetër</option></select></Field>
              <Field label="Kategoria" icon={Tags}><select name="categoryId" className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"><option value="">Pa kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
              <Field label="Kategori e re" icon={Tags}><input name="newCategory" placeholder="Opsionale" className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></Field>
              <Field label="Furnitori" icon={Store}><input name="supplier" placeholder="Emri i furnitorit" className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></Field>
              <Field label="Nr. dokumenti" icon={ReceiptText}><input name="documentNumber" placeholder="Faturë / mandat" className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></Field>
              <Field label="Shënime" icon={FileText} className="md:col-span-2 xl:col-span-3"><textarea name="notes" rows={3} placeholder="Shënime shtesë..." className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></Field>
              <button className="mt-auto h-11 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700">Regjistro shpenzimin</button>
            </div>
          </form>
        ) : null}

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div><h2 className="font-black text-slate-950">Historiku i shpenzimeve</h2><p className="mt-1 text-sm text-slate-500">{expenses.length} regjistrime të fundit</p></div>
          </div>
          {expenses.length === 0 ? (
            <div className="px-6 py-16 text-center"><ReceiptText className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-4 font-bold text-slate-900">Nuk ka ende shpenzime</h3><p className="mt-2 text-sm text-slate-500">Shpenzimet e regjistruara do të shfaqen këtu.</p></div>
          ) : (
            <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Data</th><th className="px-4 py-4">Përshkrimi</th><th className="px-4 py-4">Kategoria</th><th className="px-4 py-4">Furnitori</th><th className="px-4 py-4">Mënyra</th><th className="px-6 py-4 text-right">Shuma</th>{canManageFinance ? <th className="px-6 py-4 text-right">Veprime</th> : null}</tr></thead><tbody className="divide-y divide-slate-100">{expenses.map((expense) => <tr key={expense.id} className="transition hover:bg-slate-50/80"><td className="px-6 py-4 font-semibold text-slate-700">{new Date(expense.expenseDate).toLocaleDateString("sq-AL")}</td><td className="px-4 py-4"><p className="font-bold text-slate-900">{expense.description}</p>{expense.documentNumber ? <p className="mt-1 text-xs text-slate-400">Dok. {expense.documentNumber}</p> : null}</td><td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{expense.category?.name || "Pa kategori"}</span></td><td className="px-4 py-4 text-slate-600">{expense.supplier || "—"}</td><td className="px-4 py-4 text-slate-600">{paymentLabels[expense.paymentMethod] || expense.paymentMethod}</td><td className="px-6 py-4 text-right font-black text-slate-950">{money(expense.amount, business.currency)}</td>{canManageFinance ? <td className="px-6 py-4"><ExpenseRowActions expense={actionExpenses[expense.id]} categories={actionCategories} /></td> : null}</tr>)}</tbody></table></div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
