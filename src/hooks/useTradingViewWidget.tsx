'use client';
import { useEffect, useRef, useCallback } from "react";

const useTradingViewWidget = (scriptUrl: string, config: Record<string, unknown>, height = 600) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const scriptRef = useRef<HTMLScriptElement | null>(null);

    const cleanupWidget = useCallback(() => {
        const container = containerRef.current;
        if (container) {
            // Remove all TradingView related content
            const widgets = container.querySelectorAll('[id^="tradingview"]');
            widgets.forEach(widget => widget.remove());

            // Clear container content
            container.innerHTML = '';
            delete container.dataset.loaded;
        }

        // Remove script reference
        if (scriptRef.current) {
            scriptRef.current.remove();
            scriptRef.current = null;
        }
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        if (container.dataset.loaded) return;

        // Initialize widget with proper timing and visibility check
        const initializeWidget = () => {
            // Double-check container still exists and is in DOM
            if (!container || !container.isConnected) return;

            try {
                // Clear any existing content
                container.innerHTML = '';

                // Create widget container with unique ID to avoid conflicts
                const widgetContainer = document.createElement('div');
                const uniqueId = `tradingview-widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                widgetContainer.className = 'tradingview-widget-container__widget';
                widgetContainer.id = uniqueId;
                widgetContainer.style.width = '100%';
                widgetContainer.style.height = `${height}px`;

                container.appendChild(widgetContainer);

                // Create and configure script with enhanced error handling
                const script = document.createElement("script");
                script.src = scriptUrl;
                script.async = true;
                script.type = 'text/javascript';

                // Add configuration as JSON with proper formatting
                const configScript = document.createTextNode(JSON.stringify(config));
                script.appendChild(configScript);

                // Enhanced error handling
                script.onerror = (error) => {
                    console.warn('TradingView widget script failed to load:', error);
                    if (container.isConnected) {
                        container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #9ca3af; font-size: 14px;">Widget failed to load</div>';
                    }
                };

                script.onload = () => {
                    // Mark as loaded only after successful script load
                    if (container.isConnected) {
                        container.dataset.loaded = 'true';
                    }
                };

                container.appendChild(script);
                scriptRef.current = script;

            } catch (error) {
                console.warn('Error initializing TradingView widget:', error);
                if (container.isConnected) {
                    container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #9ca3af; font-size: 14px;">Widget initialization failed</div>';
                }
            }
        };

        // Use Intersection Observer to load widgets when visible
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.target === container) {
                        observer.disconnect();
                        // Use multiple timing strategies for better compatibility
                        if (document.readyState === 'complete') {
                            setTimeout(initializeWidget, 50);
                        } else {
                            const rafId = requestAnimationFrame(() => {
                                setTimeout(initializeWidget, 100);
                            });
                            return () => cancelAnimationFrame(rafId);
                        }
                    }
                });
            },
            {
                rootMargin: '100px', // Load widgets 100px before they become visible
                threshold: 0.1
            }
        );

        observer.observe(container);

        return () => {
            observer.disconnect();
            cleanupWidget();
        };
    }, [scriptUrl, config, height, cleanupWidget]);

    return containerRef;
}
export default useTradingViewWidget
