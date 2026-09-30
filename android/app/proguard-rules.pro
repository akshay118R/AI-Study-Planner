# Proguard Rules for Career Tracker Android Wrapper
-keepattributes *Annotation*
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keep class com.leadtracker.careertracker.** { *; }
-dontwarn com.leadtracker.careertracker.**
