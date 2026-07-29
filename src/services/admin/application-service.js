export async function approveApplication({ applicationId, reviewedById }) {
  const application = await db.businessApplication.findUnique({
    where: {
      id: applicationId,
    },
  });

  if (!application) {
    throw new Error("Aplikimi nuk u gjet.");
  }

  if (application.status !== "PENDING") {
    throw new Error("Vetëm aplikimet në pritje mund të aprovohen.");
  }

  const normalizedEmail = application.email.trim().toLowerCase();

  const existingUser = await db.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      emailVerified: true,
      isActive: true,
    },
  });

  const result = await db.$transaction(async (transaction) => {
    const trialPlan = await transaction.plan.findUnique({
      where: {
        slug: "free-trial",
      },
    });

    if (!trialPlan) {
      throw new Error(
        "Plani Free Trial nuk u gjet. Krijoje fillimisht te tabela Plan.",
      );
    }

    if (!trialPlan.isActive) {
      throw new Error("Plani Free Trial është i çaktivizuar.");
    }

    let ownerUser;

    if (existingUser) {
      ownerUser = await transaction.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          name: existingUser.name || application.ownerName,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          emailVerified: true,
        },
      });
    } else {
      ownerUser = await transaction.user.create({
        data: {
          name: application.ownerName,
          email: normalizedEmail,
          passwordHash: null,
          emailVerified: null,
          globalRole: null,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          emailVerified: true,
        },
      });
    }

    const business = await transaction.business.create({
      data: {
        name: application.businessName,
        city: application.city,
        address: application.address,
        phone: application.phone,
        email: normalizedEmail,
        isActive: true,
      },
    });

    await transaction.businessUser.create({
      data: {
        userId: ownerUser.id,
        businessId: business.id,
        role: "OWNER",
        isActive: true,
      },
    });

    const trialStartsAt = new Date();
    const trialEndsAt = new Date(trialStartsAt);

    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    const subscription = await transaction.subscription.create({
      data: {
        businessId: business.id,
        planId: trialPlan.id,
        status: "TRIALING",
        billingInterval: "MONTHLY",
        price: 0,
        trialStartsAt,
        trialEndsAt,
        currentPeriodStart: trialStartsAt,
        currentPeriodEnd: trialEndsAt,
        cancelAtPeriodEnd: false,
      },
    });

    await transaction.businessApplication.update({
      where: {
        id: application.id,
      },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedById: reviewedById || null,
        approvedBusinessId: business.id,
        rejectionReason: null,
      },
    });

    return {
      business,
      ownerUser,
      subscription,
    };
  });

  const activationRequired =
    !result.ownerUser.passwordHash || !result.ownerUser.emailVerified;

  return {
    ...result,
    activationRequired,
  };
}
