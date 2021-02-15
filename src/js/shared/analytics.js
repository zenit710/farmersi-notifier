const initAnalytics = () => {
    window._gaq = window._gaq || [];
    window._gaq.push(["_setAccount", "UA-189792765-1"]);
    window._gaq.push(["_trackPageview"]);

    (function() {
        let ga = document.createElement("script");
        ga.type = "text/javascript";
        ga.async = true;
        ga.src = "https://ssl.google-analytics.com/ga.js";
        let s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(ga, s);
    })();
};

const trackEvent = (target, action = "clicked") => {
    if (typeof window._gaq !== "undefined") {
        // eslint-disable-next-line no-undef
        window._gaq.push(["_trackEvent", target, action]);
    }
};

export {
    initAnalytics,
    trackEvent,
};
