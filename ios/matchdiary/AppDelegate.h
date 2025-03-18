#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h> // 추가

@interface AppDelegate : RCTAppDelegate <UNUserNotificationCenterDelegate> // 프로토콜 추가

@end
