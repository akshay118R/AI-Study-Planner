package com.leadtracker.careertracker

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.LinearLayout
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import androidx.webkit.WebViewAssetLoader

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var layoutLoading: LinearLayout
    private lateinit var layoutOffline: LinearLayout
    private lateinit var btnRetry: Button

    private var assetLoader: WebViewAssetLoader? = null
    private var isUsingLocalAssets = false
    private var targetUrl: String = ""
    private var hasLoadFailed = false

    inner class AndroidAppBridge {
        @JavascriptInterface
        fun exitApp() {
            runOnUiThread {
                finish()
            }
        }

        @JavascriptInterface
        fun isNativeAndroid(): Boolean {
            return true
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        setupBackNavigation()
        setupWebView()
        determineTargetUrl()
        loadAppUrl()
    }

    private fun initViews() {
        webView = findViewById(R.id.webView)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)
        layoutLoading = findViewById(R.id.layoutLoading)
        layoutOffline = findViewById(R.id.layoutOffline)
        btnRetry = findViewById(R.id.btnRetry)

        swipeRefreshLayout.setColorSchemeResources(R.color.primary)
        swipeRefreshLayout.setOnRefreshListener {
            hasLoadFailed = false
            webView.reload()
        }

        btnRetry.setOnClickListener {
            hasLoadFailed = false
            layoutOffline.visibility = View.GONE
            layoutLoading.visibility = View.VISIBLE
            webView.visibility = View.GONE
            loadAppUrl()
        }
    }

    /**
     * Native Android Hardware/System Back Navigation
     * Priority 1: Close modal/dialog/drawer/overlay if open
     * Priority 2: Dismiss active text input / blur if active
     * Priority 3: Navigate from any page (Today, Week, Month, Settings, etc.) to Dashboard
     * Priority 4: If on Dashboard, close/exit the app
     */
    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                // If offline UI is displayed, exit the app
                if (layoutOffline.visibility == View.VISIBLE) {
                    finish()
                    return
                }

                // Query JavaScript in WebView with strict native navigation priority
                webView.evaluateJavascript(
                    "(function() { return window.handleAndroidBack ? window.handleAndroidBack() : 'EXIT_APP'; })();"
                ) { result ->
                    val action = result?.trim('"', ' ') ?: "EXIT_APP"
                    when (action) {
                        "MODAL_CLOSED" -> {
                            // In-app modal closed; stay on current screen
                        }
                        "INPUT_BLURRED" -> {
                            // Active input blurred; stay on current screen
                        }
                        "NAVIGATED_TO_DASHBOARD" -> {
                            // Successfully navigated from sub-page back to Dashboard
                        }
                        "EXIT_APP" -> {
                            // Already on Dashboard and no modals are open -> Exit app
                            finish()
                        }
                        else -> {
                            // Default fallback: close app
                            finish()
                        }
                    }
                }
            }
        })
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = webView.settings

        // JavaScript and DOM Storage required for Career Tracker
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        webView.addJavascriptInterface(AndroidAppBridge(), "AndroidBridge")

        // Content access & caching
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.loadsImagesAutomatically = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        // Modern display & viewport handling
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.setSupportZoom(false)
        settings.displayZoomControls = false

        // Media and mixed content for development
        settings.mediaPlaybackRequiresUserGesture = false
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)
        }
        CookieManager.getInstance().setAcceptCookie(true)

        // AndroidX Asset Loader for secure HTTPS local asset serving (ES Modules compatible)
        assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress >= 90 && !hasLoadFailed) {
                    showWebUI()
                }
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
                if (isUsingLocalAssets && request != null) {
                    val intercepted = assetLoader?.shouldInterceptRequest(request.url)
                    if (intercepted != null) return intercepted
                }
                return super.shouldInterceptRequest(view, request)
            }

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url?.toString() ?: return false
                return handleUrlNavigation(url)
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                hasLoadFailed = false
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                swipeRefreshLayout.isRefreshing = false
                if (!hasLoadFailed) {
                    showWebUI()
                }
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                // Only show offline screen if the failure is for the main document
                if (request?.isForMainFrame == true) {
                    hasLoadFailed = true
                    showOfflineUI()
                }
            }
        }
    }

    private fun handleUrlNavigation(url: String): Boolean {
        val uri = Uri.parse(url)
        val scheme = uri.scheme?.lowercase() ?: ""
        val host = uri.host?.lowercase() ?: ""

        // External protocols
        if (scheme == "mailto" || scheme == "tel" || scheme == "intent" || scheme == "market") {
            openExternalIntent(uri)
            return true
        }

        // External media platforms (YouTube, etc. per requirement 24)
        if (host.contains("youtube.com") || host.contains("youtu.be")) {
            openExternalIntent(uri)
            return true
        }

        // External website links outside the app's domain
        if (!isUsingLocalAssets && targetUrl.isNotEmpty()) {
            val appHost = Uri.parse(targetUrl).host?.lowercase() ?: ""
            if (appHost.isNotEmpty() && host.isNotEmpty() && !host.contains(appHost) && !appHost.contains(host)) {
                openExternalIntent(uri)
                return true
            }
        }

        return false
    }

    private fun openExternalIntent(uri: Uri) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, uri)
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "No application available to open link", Toast.LENGTH_SHORT).show()
        }
    }

    private fun determineTargetUrl() {
        val configuredUrl = BuildConfig.WEB_APP_URL.trim()
        if (configuredUrl.isEmpty() || configuredUrl.equals("local", ignoreCase = true)) {
            isUsingLocalAssets = true
            targetUrl = "https://appassets.androidplatform.net/assets/www/index.html"
        } else {
            isUsingLocalAssets = false
            targetUrl = configuredUrl
        }
    }

    private fun loadAppUrl() {
        hasLoadFailed = false
        webView.loadUrl(targetUrl)
    }

    private fun showWebUI() {
        layoutLoading.visibility = View.GONE
        layoutOffline.visibility = View.GONE
        webView.visibility = View.VISIBLE
    }

    private fun showOfflineUI() {
        swipeRefreshLayout.isRefreshing = false
        layoutLoading.visibility = View.GONE
        webView.visibility = View.GONE
        layoutOffline.visibility = View.VISIBLE
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
