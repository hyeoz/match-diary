// 앱 타깃에 Swift 소스가 하나는 있어야 Xcode가 Swift 런타임 호환 라이브러리를 링크한다.
// GoogleMobileAds 같은 Swift로 빌드된 SDK가 그 심볼(__swift_FORCE_LOAD_$_swiftCompatibility*)을 필요로 한다.
import Foundation
