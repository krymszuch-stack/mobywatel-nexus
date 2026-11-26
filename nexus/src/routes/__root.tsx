import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-ext-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-ext-500.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-sans/latin-ext-600.css";
import "@fontsource/ibm-plex-serif/latin-400.css";
import "@fontsource/ibm-plex-serif/latin-ext-400.css";
import "@fontsource/ibm-plex-serif/latin-500.css";
import "@fontsource/ibm-plex-serif/latin-ext-500.css";
import "../styles.css";

const THEME_BOOT = `(function(){try{var raw=localStorage.getItem("nexus-pref");if(!raw)return;var st=JSON.parse(raw).state||{};var r=document.documentElement;if(st.theme)r.dataset.theme=st.theme;if(st.textScale)r.style.setProperty("--nx-scale",String(st.textScale));if(st.motion==="reduce")r.dataset.motion="reduce";}catch(e){}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "mObywatel NEXUS" },
      {
        name: "description",
        content: "Niezależny prototyp konkursowy usługi publicznej. Dane są fikcyjne.",
      },
      { property: "og:title", content: "mObywatel NEXUS" },
      {
        property: "og:description",
        content: "Niezależny prototyp konkursowy usługi publicznej. Dane są fikcyjne.",
      },
      { name: "theme-color", content: "#f5f7fb" },
    ],
    links: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  }),
  component: () => (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <Outlet />
        <Scripts />
      </body>
    </html>
  ),
});
