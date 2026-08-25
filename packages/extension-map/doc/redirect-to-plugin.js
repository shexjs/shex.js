/**
 * A page that was an app and is an extension now.
 *
 * shexmap-{simple,worker}.html are published URLs; ShExMap is a descriptor
 * these days, so they hand over to the app page with `?extension=` naming
 * it -- carrying whatever they were asked for, which is the whole point of
 * keeping them.
 *
 * A URL parameter is relative to the page it was written for, and the page
 * it is going to is somewhere else, so every one of them (`extension`, and
 * anything named `<something>URL`) is made absolute on the way.
 */
function redirectToPlugin (appPage, pluginUrl, defaultManifestUrl) {
  const asked = new URLSearchParams(location.search);
  const parms = new URLSearchParams();
  asked.forEach((value, key) => {
    parms.append(key, key === "extension" || key === "pluginURL" || /URL$/.test(key)
                 ? new URL(value, location.href).href
                 : value);
  });
  if (!asked.has("extension") && !asked.has("pluginURL"))
    parms.append("extension", new URL(pluginUrl, location.href).href);
  // the manifest this page has always opened with, unless one was asked for
  if (defaultManifestUrl && !asked.has("manifest") && !asked.has("manifestURL"))
    parms.append("manifestURL", new URL(defaultManifestUrl, location.href).href);
  location.replace(new URL(appPage, location.href).href + "?" + parms);
}
