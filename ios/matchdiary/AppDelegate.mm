#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <UserNotifications/UserNotifications.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"matchdiary";
  self.initialProps = @{};

  // Define UNUserNotificationCenter
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;;//
  
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
       withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end

#pragma mark - UIScene life cycle

// iOS 27 SDK로 빌드한 앱은 UIScene 생명주기를 채택하지 않으면 실행 즉시 종료된다.
// RCTAppDelegate가 didFinishLaunching에서 만든 React Native 창을 씬에 붙이고,
// 씬 생명주기에서 UIKit이 더 이상 앱 델리게이트로 보내지 않는 이벤트를 그대로 전달한다.
@interface SceneDelegate : UIResponder <UIWindowSceneDelegate>
@property (nonatomic, strong) UIWindow *window;
@end

@implementation SceneDelegate

- (id<UIApplicationDelegate>)appDelegate
{
  return UIApplication.sharedApplication.delegate;
}

- (void)scene:(UIScene *)scene
    willConnectToSession:(UISceneSession *)session
                 options:(UISceneConnectionOptions *)connectionOptions
{
  if (![scene isKindOfClass:[UIWindowScene class]]) {
    return;
  }
  UIWindowScene *windowScene = (UIWindowScene *)scene;
  id<UIApplicationDelegate> appDelegate = [self appDelegate];
  UIWindow *window = [appDelegate respondsToSelector:@selector(window)] ? appDelegate.window : nil;

  if (window != nil) {
    window.windowScene = windowScene;
    window.frame = windowScene.coordinateSpace.bounds;
  } else {
    window = [[UIWindow alloc] initWithWindowScene:windowScene];
    if ([appDelegate respondsToSelector:@selector(setWindow:)]) {
      appDelegate.window = window;
    }
  }
  self.window = window;
  [window makeKeyAndVisible];

  // 앱이 꺼진 상태에서 링크·유니버설 링크·빠른 동작으로 실행된 경우
  if (connectionOptions.URLContexts.count > 0) {
    [self scene:scene openURLContexts:connectionOptions.URLContexts];
  }
  for (NSUserActivity *userActivity in connectionOptions.userActivities) {
    [self scene:scene continueUserActivity:userActivity];
  }
  if (connectionOptions.shortcutItem != nil) {
    [self windowScene:windowScene
        performActionForShortcutItem:connectionOptions.shortcutItem
                   completionHandler:^(BOOL succeeded){
                   }];
  }
}

- (void)windowScene:(UIWindowScene *)windowScene
    didUpdateCoordinateSpace:(id<UICoordinateSpace>)previousCoordinateSpace
        interfaceOrientation:(UIInterfaceOrientation)previousInterfaceOrientation
             traitCollection:(UITraitCollection *)previousTraitCollection
{
  // RCTAppDelegate가 RCTWindowFrameDidChangeNotification을 보내도록 전달한다.
  id appDelegate = [self appDelegate];
  if ([appDelegate respondsToSelector:_cmd]) {
    [(id<UIWindowSceneDelegate>)appDelegate windowScene:windowScene
                               didUpdateCoordinateSpace:previousCoordinateSpace
                                   interfaceOrientation:previousInterfaceOrientation
                                        traitCollection:previousTraitCollection];
  }
}

- (void)sceneDidBecomeActive:(UIScene *)scene
{
  id<UIApplicationDelegate> appDelegate = [self appDelegate];
  if ([appDelegate respondsToSelector:@selector(applicationDidBecomeActive:)]) {
    [appDelegate applicationDidBecomeActive:UIApplication.sharedApplication];
  }
}

- (void)sceneWillResignActive:(UIScene *)scene
{
  id<UIApplicationDelegate> appDelegate = [self appDelegate];
  if ([appDelegate respondsToSelector:@selector(applicationWillResignActive:)]) {
    [appDelegate applicationWillResignActive:UIApplication.sharedApplication];
  }
}

- (void)sceneWillEnterForeground:(UIScene *)scene
{
  id<UIApplicationDelegate> appDelegate = [self appDelegate];
  if ([appDelegate respondsToSelector:@selector(applicationWillEnterForeground:)]) {
    [appDelegate applicationWillEnterForeground:UIApplication.sharedApplication];
  }
}

- (void)sceneDidEnterBackground:(UIScene *)scene
{
  id<UIApplicationDelegate> appDelegate = [self appDelegate];
  if ([appDelegate respondsToSelector:@selector(applicationDidEnterBackground:)]) {
    [appDelegate applicationDidEnterBackground:UIApplication.sharedApplication];
  }
}

- (void)scene:(UIScene *)scene openURLContexts:(NSSet<UIOpenURLContext *> *)URLContexts
{
  id<UIApplicationDelegate> appDelegate = [self appDelegate];
  if (![appDelegate respondsToSelector:@selector(application:openURL:options:)]) {
    return;
  }
  for (UIOpenURLContext *context in URLContexts) {
    NSMutableDictionary<UIApplicationOpenURLOptionsKey, id> *options = [NSMutableDictionary dictionary];
    if (context.options.sourceApplication != nil) {
      options[UIApplicationOpenURLOptionsSourceApplicationKey] = context.options.sourceApplication;
    }
    if (context.options.annotation != nil) {
      options[UIApplicationOpenURLOptionsAnnotationKey] = context.options.annotation;
    }
    options[UIApplicationOpenURLOptionsOpenInPlaceKey] = @(context.options.openInPlace);
    [appDelegate application:UIApplication.sharedApplication openURL:context.URL options:options];
  }
}

- (void)scene:(UIScene *)scene continueUserActivity:(NSUserActivity *)userActivity
{
  id<UIApplicationDelegate> appDelegate = [self appDelegate];
  if ([appDelegate respondsToSelector:@selector(application:continueUserActivity:restorationHandler:)]) {
    [appDelegate application:UIApplication.sharedApplication
        continueUserActivity:userActivity
          restorationHandler:^(NSArray<id<UIUserActivityRestoring>> *_Nullable restorableObjects){
          }];
  }
}

- (void)windowScene:(UIWindowScene *)windowScene
    performActionForShortcutItem:(UIApplicationShortcutItem *)shortcutItem
               completionHandler:(void (^)(BOOL succeeded))completionHandler
{
  id<UIApplicationDelegate> appDelegate = [self appDelegate];
  if ([appDelegate respondsToSelector:@selector(application:performActionForShortcutItem:completionHandler:)]) {
    [appDelegate application:UIApplication.sharedApplication
        performActionForShortcutItem:shortcutItem
                   completionHandler:completionHandler];
  } else {
    completionHandler(NO);
  }
}

@end
