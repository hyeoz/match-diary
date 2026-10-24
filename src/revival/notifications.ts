import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

const CHANNEL_ID = 'matchdiary-attendance-reminders';

export const scheduleLocalNotification = async ({
  id,
  scheduledAt,
  title,
  body,
}: {
  id: string;
  scheduledAt: string;
  title: string;
  body: string;
}): Promise<string> => {
  const timestamp = new Date(scheduledAt).getTime();
  if (!Number.isFinite(timestamp) || timestamp <= Date.now()) {
    throw new Error('REMINDER_DATE_PASSED');
  }

  const permission = await notifee.requestPermission();
  if (permission.authorizationStatus === AuthorizationStatus.DENIED) {
    throw new Error('NOTIFICATION_PERMISSION_DENIED');
  }

  const channelId = await notifee.createChannel({
    id: CHANNEL_ID,
    name: '직관 일정 알림',
    importance: AndroidImportance.HIGH,
  });
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp,
  };

  return notifee.createTriggerNotification(
    {
      id,
      title,
      body,
      android: { channelId, pressAction: { id: 'default' } },
      ios: { sound: 'default' },
    },
    trigger,
  );
};

export const cancelLocalNotification = async (
  nativeNotificationId: string | null,
): Promise<void> => {
  if (nativeNotificationId) {
    await notifee.cancelNotification(nativeNotificationId);
  }
};
