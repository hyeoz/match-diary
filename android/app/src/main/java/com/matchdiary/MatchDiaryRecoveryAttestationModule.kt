package com.matchdiary

import android.provider.Settings
import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeMap
import com.google.android.play.core.integrity.IntegrityManagerFactory
import com.google.android.play.core.integrity.StandardIntegrityManager
import java.security.MessageDigest

class MatchDiaryRecoveryAttestationModule(
    reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  private var tokenProvider: StandardIntegrityManager.StandardIntegrityTokenProvider? = null
  private val integrityManager = IntegrityManagerFactory.createStandard(reactContext)

  override fun getName() = "MatchDiaryRecoveryAttestation"

  override fun getConstants(): MutableMap<String, Any> =
      hashMapOf("apiBaseUrl" to BuildConfig.MATCHDIARY_RECOVERY_API_BASE_URL)

  @ReactMethod
  fun getIdentity(promise: Promise) {
    val identifier =
        Settings.Secure.getString(
            reactApplicationContext.contentResolver,
            Settings.Secure.ANDROID_ID,
        )
    if (identifier.isNullOrBlank()) {
      promise.reject("RECOVERY_IDENTITY_UNAVAILABLE", "Device identity is unavailable")
      return
    }
    val result = WritableNativeMap()
    result.putString("platform", "android")
    result.putString("deviceId", identifier)
    promise.resolve(result)
  }

  @ReactMethod
  fun isSupported(promise: Promise) {
    promise.resolve(BuildConfig.MATCHDIARY_PLAY_CLOUD_PROJECT_NUMBER.isNotBlank())
  }

  private fun requestHash(challenge: String): String {
    val digest = MessageDigest.getInstance("SHA-256").digest(challenge.toByteArray(Charsets.UTF_8))
    return Base64.encodeToString(digest, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)
  }

  private fun requestToken(challenge: String, promise: Promise) {
    val provider = tokenProvider
    if (provider == null) {
      promise.reject("RECOVERY_ATTESTATION_FAILED", "Play Integrity provider is unavailable")
      return
    }
    val request =
        StandardIntegrityManager.StandardIntegrityTokenRequest.builder()
            .setRequestHash(requestHash(challenge))
            .build()
    provider.request(request)
        .addOnSuccessListener { response ->
          val result = WritableNativeMap()
          result.putString("platform", "android")
          result.putString("token", response.token())
          result.putString("attestationType", "integrity")
          promise.resolve(result)
        }
        .addOnFailureListener { error ->
          promise.reject("RECOVERY_ATTESTATION_FAILED", "Play Integrity request failed", error)
        }
  }

  @ReactMethod
  fun attest(challenge: String, promise: Promise) {
    val projectNumber = BuildConfig.MATCHDIARY_PLAY_CLOUD_PROJECT_NUMBER.toLongOrNull()
    if (projectNumber == null) {
      promise.reject("RECOVERY_ATTESTATION_UNSUPPORTED", "Play Integrity is not configured")
      return
    }
    if (tokenProvider != null) {
      requestToken(challenge, promise)
      return
    }
    val request =
        StandardIntegrityManager.PrepareIntegrityTokenRequest.builder()
            .setCloudProjectNumber(projectNumber)
            .build()
    integrityManager.prepareIntegrityToken(request)
        .addOnSuccessListener { provider ->
          tokenProvider = provider
          requestToken(challenge, promise)
        }
        .addOnFailureListener { error ->
          promise.reject("RECOVERY_ATTESTATION_FAILED", "Play Integrity preparation failed", error)
        }
  }

  @ReactMethod
  fun reset(promise: Promise) {
    tokenProvider = null
    promise.resolve(null)
  }
}
