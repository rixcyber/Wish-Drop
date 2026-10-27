import { commitStore, loadStore, store, type StoreData } from "./store";
import type { Backend, ContributionInput, ReportInput, ThankYouInput } from "./backend";
import { filterWishes, sortWishes, wishProgress } from "./backend";
import { resizeImageFile } from "./image";
import type { AppNotification, Contribution, Wish } from "./types";

function notify(data: StoreData, n: AppNotification) {
  data.notifications.unshift(n);
}

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export const localBackend: Backend = {
  mode: "local-demo",

  getSession: () => store.session(),
  subscribeAuth(listener) {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "wishdrop.session.v1") return;
      let next: { profileId: string; email: string } | null = null;
      try {
        next = event.newValue ? (JSON.parse(event.newValue) as { profileId: string; email: string }) : null;
      } catch {
        next = null;
      }
      listener(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  },
  signIn: (email, password) => store.signIn(email, password),
  signUp: (input) => store.signUp(input),
  signOut: async () => {
    await store.signOut();
  },

  async getProfile(id) {
    const data = await loadStore();
    return data.profiles.find((p) => p.id === id) ?? null;
  },
  async listProfiles() {
    const data = await loadStore();
    return [...data.profiles];
  },
  async updateProfile(id, patch) {
    const data = await loadStore();
    const profile = data.profiles.find((p) => p.id === id);
    if (!profile) throw new Error("Profile not found.");
    Object.assign(profile, patch);
    commitStore(data);
    return { ...profile };
  },
  async setProfileStatus(id, status) {
    const data = await loadStore();
    const profile = data.profiles.find((p) => p.id === id);
    if (!profile) throw new Error("Profile not found.");
    profile.status = status;
    commitStore(data);
  },

  async listWishes(filter = {}) {
    const data = await loadStore();
    const visible = data.wishes.filter((wish) => {
      if (wish.removed && !filter.includeRemoved) return false;
      const author = data.profiles.find((p) => p.id === wish.authorId);
      if (author?.status === "banned" && !filter.includeRemoved) return false;
      return true;
    });
    return sortWishes(filterWishes(visible, filter), filter.sort ?? "newest");
  },

  async getWish(id) {
    const data = await loadStore();
    return data.wishes.find((w) => w.id === id) ?? null;
  },

  async createWish(authorId, draft) {
    const data = await loadStore();
    const now = new Date().toISOString();
    const wish: Wish = {
      id: newId("w"),
      authorId,
      title: draft.title.trim(),
      story: draft.story.trim(),
      category: draft.category,
      goalAmount: draft.goalAmount,
      currency: draft.currency,
      imageUrl: draft.imageUrl,
      itemUrl: draft.itemUrl?.trim() || null,
      fulfillmentMethod: draft.fulfillmentMethod,
      anonymous: draft.anonymous,
      status: "open",
      raisedAmount: 0,
      supporterCount: 0,
      thankYou: null,
      createdAt: now,
      updatedAt: now,
      removed: false,
      removeReason: null,
      featured: false,
    };
    data.wishes.unshift(wish);
    commitStore(data);
    return { ...wish };
  },

  async updateWish(id, patch) {
    const data = await loadStore();
    const wish = data.wishes.find((w) => w.id === id);
    if (!wish) throw new Error("Wish not found.");
    Object.assign(wish, patch, { updatedAt: new Date().toISOString() });
    wish.status = wishProgress(wish).status;
    commitStore(data);
    return { ...wish };
  },

  async deleteWish(id) {
    const data = await loadStore();
    data.wishes = data.wishes.filter((w) => w.id !== id);
    data.saved = data.saved.filter((s) => s.wishId !== id);
    commitStore(data);
  },

  async moderateWish(id, action) {
    const data = await loadStore();
    const wish = data.wishes.find((w) => w.id === id);
    if (!wish) throw new Error("Wish not found.");
    wish.removed = action.remove;
    wish.removeReason = action.remove ? action.reason ?? "Removed by moderation." : null;
    if (action.feature !== undefined) wish.featured = action.feature;
    wish.updatedAt = new Date().toISOString();

    if (action.remove) {
      notify(data, {
        id: newId("n"),
        profileId: wish.authorId,
        kind: "moderation",
        title: "Your wish was removed by moderation",
        body: wish.removeReason ?? "It did not meet the platform rules.",
        href: "/account?tab=wishes",
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    commitStore(data);
    return { ...wish };
  },

  async listSaved(profileId) {
    const data = await loadStore();
    const ids = data.saved.filter((s) => s.profileId === profileId).map((s) => s.wishId);
    return data.wishes
      .filter((w) => ids.includes(w.id) && !w.removed)
      .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  },

  async toggleSave(profileId, wishId) {
    const data = await loadStore();
    const existing = data.saved.find((s) => s.profileId === profileId && s.wishId === wishId);
    if (existing) {
      data.saved = data.saved.filter((s) => !(s.profileId === profileId && s.wishId === wishId));
      commitStore(data);
      return false;
    }
    data.saved.push({ profileId, wishId, createdAt: new Date().toISOString() });
    commitStore(data);
    return true;
  },

  async createContribution(input: ContributionInput) {
    const data = await loadStore();
    const wish = data.wishes.find((w) => w.id === input.wishId);
    if (!wish) throw new Error("Wish not found.");
    if (wish.removed) throw new Error("This wish is no longer accepting support.");
    if (wish.authorId === input.supporterId) {
      throw new Error("You can't fund your own wish.");
    }
    const amount = Math.round(input.amount * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter an amount greater than zero.");
    if (amount > wish.goalAmount - wish.raisedAmount) {
      throw new Error("That is more than the remaining amount for this wish.");
    }

    const contribution = {
      id: newId("c"),
      wishId: wish.id,
      supporterId: input.supporterId,
      amount,
      currency: wish.currency,
      anonymous: input.anonymous,
      method: input.method,
      status: input.paymentStatus,
      isDemo: true,
      reference: input.paymentReference,
      message: input.message,
      createdAt: new Date().toISOString(),
    };

    data.contributions.unshift(contribution);
    wish.raisedAmount = Math.round((wish.raisedAmount + amount) * 100) / 100;
    wish.supporterCount += 1;
    wish.status = wishProgress(wish).status;
    wish.updatedAt = new Date().toISOString();

    const supporter = data.profiles.find((p) => p.id === input.supporterId);
    const supporterName =
      input.anonymous || supporter?.anonymous
        ? "An anonymous supporter"
        : supporter?.displayName ?? "A supporter";

    notify(data, {
      id: newId("n"),
      profileId: wish.authorId,
      kind: "supported",
      title: `Your wish received support`,
      body: `${supporterName} contributed ${amount} ${wish.currency} (demo payment ${contribution.reference}).`,
      href: `/wishes/${wish.id}`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    if (wish.status === "fulfilled") {
      notify(data, {
        id: newId("n"),
        profileId: wish.authorId,
        kind: "fulfilled",
        title: "Your wish is fully funded",
        body: `“${wish.title}” reached its goal. Arrange delivery privately and post a thank-you when you're ready.`,
        href: `/wishes/${wish.id}`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    commitStore(data);
    return { contribution: { ...contribution }, wish: { ...wish } };
  },

  async listMyContributions(profileId) {
    const data = await loadStore();
    return data.contributions
      .filter((c) => c.supporterId === profileId)
      .map((c) => {
        const wish = data.wishes.find((w) => w.id === c.wishId);
        return wish ? { ...c, wish: { ...wish } } : null;
      })
      .filter((x): x is Contribution & { wish: Wish } => x !== null);
  },

  async listNotifications(profileId) {
    const data = await loadStore();
    return data.notifications
      .filter((n) => n.profileId === profileId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  },

  async markNotificationsRead(profileId) {
    const data = await loadStore();
    for (const n of data.notifications) {
      if (n.profileId === profileId) n.read = true;
    }
    commitStore(data);
  },

  async createReport(input: ReportInput) {
    const data = await loadStore();
    const report = {
      id: newId("r"),
      wishId: input.wishId,
      reporterId: input.reporterId,
      reason: input.reason,
      details: input.details.trim(),
      status: "open" as const,
      createdAt: new Date().toISOString(),
      resolution: null,
    };
    data.reports.unshift(report);
    commitStore(data);
    return { ...report };
  },

  async listReports() {
    const data = await loadStore();
    return [...data.reports].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  },

  async updateReport(id, patch) {
    const data = await loadStore();
    const report = data.reports.find((r) => r.id === id);
    if (!report) throw new Error("Report not found.");
    report.status = patch.status;
    if (patch.resolution !== undefined) report.resolution = patch.resolution;
    commitStore(data);
    return { ...report };
  },

  async postThankYou(input: ThankYouInput) {
    const data = await loadStore();
    const wish = data.wishes.find((w) => w.id === input.wishId);
    if (!wish) throw new Error("Wish not found.");
    const thankYou = {
      id: newId("t"),
      wishId: wish.id,
      fromProfileId: input.fromProfileId,
      toProfileId: wish.authorId,
      anonymous: input.anonymous,
      message: input.message.trim(),
      createdAt: new Date().toISOString(),
    };
    data.thankYous.unshift(thankYou);
    wish.thankYou = thankYou.message;

    const from = data.profiles.find((p) => p.id === input.fromProfileId);
    const sender = input.anonymous || from?.anonymous ? "An anonymous supporter" : from?.displayName ?? "A supporter";
    for (const supporter of new Set(
      data.contributions.filter((c) => c.wishId === wish.id).map((c) => c.supporterId),
    )) {
      if (supporter === input.fromProfileId) continue;
      notify(data, {
        id: newId("n"),
        profileId: supporter,
        kind: "thank_you",
        title: `${sender} posted a thank-you`,
        body: input.message.trim().slice(0, 140),
        href: `/wishes/${wish.id}`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    commitStore(data);
    return { ...thankYou };
  },

  async listThankYous(wishId) {
    const data = await loadStore();
    return data.thankYous.filter((t) => t.wishId === wishId);
  },

  async uploadWishImage(file) {
    const { dataUrl } = await resizeImageFile(file);
    return dataUrl;
  },

  async resetDemoData() {
    await store.reset();
  },
};
