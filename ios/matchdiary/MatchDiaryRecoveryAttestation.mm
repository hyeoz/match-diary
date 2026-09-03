#import <CommonCrypto/CommonDigest.h>
#import <DeviceCheck/DeviceCheck.h>
#import <React/RCTBridgeModule.h>
#import <UIKit/UIKit.h>

@interface MatchDiaryRecoveryAttestation : NSObject <RCTBridgeModule>
@end

@implementation MatchDiaryRecoveryAttestation

RCT_EXPORT_MODULE(MatchDiaryRecoveryAttestation)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (NSDictionary *)constantsToExport
{
  NSString *apiBaseURL = [[NSBundle mainBundle]
      objectForInfoDictionaryKey:@"MatchDiaryRecoveryAPIBaseURL"] ?: @"";
  return @{ @"apiBaseUrl" : apiBaseURL };
}

- (NSData *)sha256:(NSString *)value
{
  NSData *data = [value dataUsingEncoding:NSUTF8StringEncoding];
  unsigned char digest[CC_SHA256_DIGEST_LENGTH];
  CC_SHA256(data.bytes, (CC_LONG)data.length, digest);
  return [NSData dataWithBytes:digest length:CC_SHA256_DIGEST_LENGTH];
}

RCT_REMAP_METHOD(getIdentity,
                 getIdentityWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *identifier = UIDevice.currentDevice.identifierForVendor.UUIDString;
  if (identifier.length == 0) {
    reject(@"RECOVERY_IDENTITY_UNAVAILABLE", @"Device identity is unavailable", nil);
    return;
  }
  resolve(@{ @"platform" : @"ios", @"deviceId" : identifier });
}

RCT_REMAP_METHOD(isSupported,
                 isSupportedWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  if (@available(iOS 14.0, *)) {
    resolve(@(DCAppAttestService.sharedService.isSupported));
  } else {
    resolve(@NO);
  }
}

RCT_REMAP_METHOD(attest,
                 attestChallenge:(NSString *)challenge
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  if (@available(iOS 14.0, *)) {
    DCAppAttestService *service = DCAppAttestService.sharedService;
    if (!service.isSupported) {
      reject(@"RECOVERY_ATTESTATION_UNSUPPORTED", @"App Attest is unavailable", nil);
      return;
    }
    NSData *clientDataHash = [self sha256:challenge];
    NSString *storedKey = [[NSUserDefaults standardUserDefaults]
        stringForKey:@"MatchDiaryRecoveryAppAttestKeyV1"];
    if (storedKey.length > 0) {
      [service generateAssertion:storedKey
                  clientDataHash:clientDataHash
               completionHandler:^(NSData *_Nullable assertion,
                                   NSError *_Nullable error) {
        if (error || !assertion) {
          reject(@"RECOVERY_ATTESTATION_FAILED", @"App Attest assertion failed", error);
          return;
        }
        resolve(@{
          @"platform" : @"ios",
          @"token" : [assertion base64EncodedStringWithOptions:0],
          @"keyId" : storedKey,
          @"attestationType" : @"assertion"
        });
      }];
      return;
    }

    [service generateKeyWithCompletionHandler:^(NSString *_Nullable keyId,
                                                NSError *_Nullable keyError) {
      if (keyError || keyId.length == 0) {
        reject(@"RECOVERY_ATTESTATION_FAILED", @"App Attest key generation failed", keyError);
        return;
      }
      [service attestKey:keyId
          clientDataHash:clientDataHash
       completionHandler:^(NSData *_Nullable attestation,
                           NSError *_Nullable attestError) {
        if (attestError || !attestation) {
          reject(@"RECOVERY_ATTESTATION_FAILED", @"App Attest failed", attestError);
          return;
        }
        [[NSUserDefaults standardUserDefaults]
            setObject:keyId
               forKey:@"MatchDiaryRecoveryAppAttestKeyV1"];
        resolve(@{
          @"platform" : @"ios",
          @"token" : [attestation base64EncodedStringWithOptions:0],
          @"keyId" : keyId,
          @"attestationType" : @"attestation"
        });
      }];
    }];
    return;
  }
  reject(@"RECOVERY_ATTESTATION_UNSUPPORTED", @"App Attest requires iOS 14 or later", nil);
}

RCT_REMAP_METHOD(reset,
                 resetWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  [[NSUserDefaults standardUserDefaults]
      removeObjectForKey:@"MatchDiaryRecoveryAppAttestKeyV1"];
  resolve(nil);
}

@end
