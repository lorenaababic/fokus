import { LocalNotifications } from "@capacitor/local-notifications";

const REMINDER_ID = 1;
const CHANNEL_ID = "daily-reminders";

async function ensureChannel() {
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: "Dnevni podsjetnici",
      description: "Podsjetnik za dnevni check-in",
      importance: 5, 
      visibility: 1,
      vibration: true,
    });
  } catch {

  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { display } = await LocalNotifications.requestPermissions();
  return display === "granted";
}

export async function scheduleDailyReminder(hour: number, minute: number) {
  await ensureChannel();
  await cancelDailyReminder();

  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_ID,
        title: "Goal Planner 🎯",
        body: "Jesi li odradila današnji check-in?",
        channelId: CHANNEL_ID,
        schedule: {
          on: { hour, minute },
          allowWhileIdle: true,
        },
      },
    ],
  });
}

export async function cancelDailyReminder() {
  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
}

export async function isReminderScheduled(): Promise<boolean> {
  const { notifications } = await LocalNotifications.getPending();
  return notifications.some((n) => n.id === REMINDER_ID);
}