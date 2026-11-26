globalThis.__nitro_main__ = import.meta.url;
import { a as toEventHandler, c as serve, i as defineLazyEventHandler, n as HTTPError, r as defineHandler, s as NodeResponse, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { i as withoutTrailingSlash, n as joinURL, r as withLeadingSlash, t as decodePath } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
// ../node_modules/.bun/nitro@3.0.260610-beta+81b37bdc146c9514/node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
// #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/favicon.svg": {
		"type": "image/svg+xml",
		"etag": "\"1de-GLWbo+2VhN8bsc2HH/lsvRYiQKc\"",
		"mtime": "2026-11-26T10:36:10.828Z",
		"size": 478,
		"path": "../public/favicon.svg"
	},
	"/glyphs/alert.svg": {
		"type": "image/svg+xml",
		"etag": "\"1c3-wfXOLRNA3hc0/5rjcgwjRF7YQcg\"",
		"mtime": "2026-11-26T10:36:10.826Z",
		"size": 451,
		"path": "../public/glyphs/alert.svg"
	},
	"/glyphs/calendar.svg": {
		"type": "image/svg+xml",
		"etag": "\"1a2-W5by/PTV9TlTHt0pHHn2msvBwXM\"",
		"mtime": "2026-11-26T10:36:10.826Z",
		"size": 418,
		"path": "../public/glyphs/calendar.svg"
	},
	"/glyphs/case.svg": {
		"type": "image/svg+xml",
		"etag": "\"1fd-wo9dmQPOTdJfhcnG5PWnXFf2amY\"",
		"mtime": "2026-11-26T10:36:10.826Z",
		"size": 509,
		"path": "../public/glyphs/case.svg"
	},
	"/glyphs/back.svg": {
		"type": "image/svg+xml",
		"etag": "\"c1-eChebHoZlsYo0qQCe/Bl4+IQ7MQ\"",
		"mtime": "2026-11-26T10:36:10.825Z",
		"size": 193,
		"path": "../public/glyphs/back.svg"
	},
	"/glyphs/check.svg": {
		"type": "image/svg+xml",
		"etag": "\"cc-YU3S8ukSF32kfoSMWZYCfWiGXhw\"",
		"mtime": "2026-11-26T10:36:10.826Z",
		"size": 204,
		"path": "../public/glyphs/check.svg"
	},
	"/glyphs/clock.svg": {
		"type": "image/svg+xml",
		"etag": "\"13d-cTq/ze79aCGJcz0AepjwP8iPGug\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 317,
		"path": "../public/glyphs/clock.svg"
	},
	"/glyphs/close.svg": {
		"type": "image/svg+xml",
		"etag": "\"c7-ysfNG1oKdAcrXaXiI+UeHjLbJSs\"",
		"mtime": "2026-11-26T10:36:10.826Z",
		"size": 199,
		"path": "../public/glyphs/close.svg"
	},
	"/glyphs/code.svg": {
		"type": "image/svg+xml",
		"etag": "\"2ba-2t1+IdnYQvqjU/YDlBLPHC5IUjI\"",
		"mtime": "2026-11-26T10:36:10.826Z",
		"size": 698,
		"path": "../public/glyphs/code.svg"
	},
	"/glyphs/bell.svg": {
		"type": "image/svg+xml",
		"etag": "\"19b-ENryaJguNS+AONW6A2j7rVQuKKo\"",
		"mtime": "2026-11-26T10:36:10.826Z",
		"size": 411,
		"path": "../public/glyphs/bell.svg"
	},
	"/glyphs/contrast.svg": {
		"type": "image/svg+xml",
		"etag": "\"109-GladkhlW2+p5Tecgyn0wyasiaNg\"",
		"mtime": "2026-11-26T10:36:10.826Z",
		"size": 265,
		"path": "../public/glyphs/contrast.svg"
	},
	"/glyphs/download.svg": {
		"type": "image/svg+xml",
		"etag": "\"fc-LuJQxJgtqYtFM1FHlWrhclfQxDI\"",
		"mtime": "2026-11-26T10:36:10.826Z",
		"size": 252,
		"path": "../public/glyphs/download.svg"
	},
	"/glyphs/education.svg": {
		"type": "image/svg+xml",
		"etag": "\"191-EjA+phYKBp00tVzc3apYzLsOmZg\"",
		"mtime": "2026-11-26T10:36:10.826Z",
		"size": 401,
		"path": "../public/glyphs/education.svg"
	},
	"/glyphs/draft.svg": {
		"type": "image/svg+xml",
		"etag": "\"16e-swAjrWvjfj9vuXawunsoTMrbmOo\"",
		"mtime": "2026-11-26T10:36:10.828Z",
		"size": 366,
		"path": "../public/glyphs/draft.svg"
	},
	"/glyphs/expand.svg": {
		"type": "image/svg+xml",
		"etag": "\"c9-YkrBYT0z1Lzzu7GC3JVwCpBzlmI\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 201,
		"path": "../public/glyphs/expand.svg"
	},
	"/glyphs/documents.svg": {
		"type": "image/svg+xml",
		"etag": "\"21f-S+AHsxsz8AhPiDqkh9Bl/cXxgxU\"",
		"mtime": "2026-11-26T10:36:10.828Z",
		"size": 543,
		"path": "../public/glyphs/documents.svg"
	},
	"/glyphs/child.svg": {
		"type": "image/svg+xml",
		"etag": "\"15d-JeXSueSHtC0JD2ncFkTD2BoI0Sc\"",
		"mtime": "2026-11-26T10:36:10.826Z",
		"size": 349,
		"path": "../public/glyphs/child.svg"
	},
	"/glyphs/family.svg": {
		"type": "image/svg+xml",
		"etag": "\"232-8uiDR2Z+N21kzAnPpUJqWgGVuE4\"",
		"mtime": "2026-11-26T10:36:10.826Z",
		"size": 562,
		"path": "../public/glyphs/family.svg"
	},
	"/glyphs/filter.svg": {
		"type": "image/svg+xml",
		"etag": "\"13f-i9ozVZ1fGYPKj/UjeTFTdv1whtM\"",
		"mtime": "2026-11-26T10:36:10.826Z",
		"size": 319,
		"path": "../public/glyphs/filter.svg"
	},
	"/glyphs/health.svg": {
		"type": "image/svg+xml",
		"etag": "\"2ab-LstTNiI1FyMISEj/qUIaBzCH1dI\"",
		"mtime": "2026-11-26T10:36:10.826Z",
		"size": 683,
		"path": "../public/glyphs/health.svg"
	},
	"/glyphs/identity.svg": {
		"type": "image/svg+xml",
		"etag": "\"1e6-ToX/7S2rYJlk/pQAXW2IldOHnZE\"",
		"mtime": "2026-11-26T10:36:10.826Z",
		"size": 486,
		"path": "../public/glyphs/identity.svg"
	},
	"/glyphs/emergency.svg": {
		"type": "image/svg+xml",
		"etag": "\"199-cHI3fdfb+eVSqhkEhES74dLmpiQ\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 409,
		"path": "../public/glyphs/emergency.svg"
	},
	"/glyphs/housing.svg": {
		"type": "image/svg+xml",
		"etag": "\"183-qHoj890CBsQUSJmIL+szBg7Nmk8\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 387,
		"path": "../public/glyphs/housing.svg"
	},
	"/glyphs/forward.svg": {
		"type": "image/svg+xml",
		"etag": "\"bf-MHMGoyvD2W65esDu9FB6wztlX80\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 191,
		"path": "../public/glyphs/forward.svg"
	},
	"/glyphs/eye.svg": {
		"type": "image/svg+xml",
		"etag": "\"1e6-uXkmJ2AUnFdDLiL1l7BKO4YkvSY\"",
		"mtime": "2026-11-26T10:36:10.826Z",
		"size": 486,
		"path": "../public/glyphs/eye.svg"
	},
	"/glyphs/info.svg": {
		"type": "image/svg+xml",
		"etag": "\"17a-ZMrJ4eUspRMjQxDyMik+SmPNTEI\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 378,
		"path": "../public/glyphs/info.svg"
	},
	"/glyphs/institution.svg": {
		"type": "image/svg+xml",
		"etag": "\"17b-nHzYD+8rNZtXwEckv76V1LUfQpU\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 379,
		"path": "../public/glyphs/institution.svg"
	},
	"/glyphs/key.svg": {
		"type": "image/svg+xml",
		"etag": "\"14f-f/tn+MEDqqtxA+8AVDczcy1PVZ0\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 335,
		"path": "../public/glyphs/key.svg"
	},
	"/glyphs/location.svg": {
		"type": "image/svg+xml",
		"etag": "\"19f-WNh0QdsaBudaBSjo5zKtJ9HlWYQ\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 415,
		"path": "../public/glyphs/location.svg"
	},
	"/glyphs/menu.svg": {
		"type": "image/svg+xml",
		"etag": "\"ca-50H7C5SGVSkoSkexUtM+AJFEbdE\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 202,
		"path": "../public/glyphs/menu.svg"
	},
	"/glyphs/more.svg": {
		"type": "image/svg+xml",
		"etag": "\"26f-FTmke6LbzLpWOhoH8C4VakRvgc4\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 623,
		"path": "../public/glyphs/more.svg"
	},
	"/glyphs/letter.svg": {
		"type": "image/svg+xml",
		"etag": "\"1a3-ulk3rOlow1tVNb22fyKenQCOMfg\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 419,
		"path": "../public/glyphs/letter.svg"
	},
	"/glyphs/orbit.svg": {
		"type": "image/svg+xml",
		"etag": "\"268-76lJ6kbBXC5qhWGRhdvVtsAZ3eo\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 616,
		"path": "../public/glyphs/orbit.svg"
	},
	"/glyphs/lock.svg": {
		"type": "image/svg+xml",
		"etag": "\"1e0-d9kPPcGo/RYrBsdsWWG977xabO8\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 480,
		"path": "../public/glyphs/lock.svg"
	},
	"/glyphs/moon.svg": {
		"type": "image/svg+xml",
		"etag": "\"15f-FluZVv6oIlwg9A7MBArsxCLro7c\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 351,
		"path": "../public/glyphs/moon.svg"
	},
	"/glyphs/passport.svg": {
		"type": "image/svg+xml",
		"etag": "\"19b-n0LeCRD7mjuGcalNBveOAbKWGiU\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 411,
		"path": "../public/glyphs/passport.svg"
	},
	"/glyphs/pin.svg": {
		"type": "image/svg+xml",
		"etag": "\"14c-hIociUKKQQq8ePI6ZQh1c6OEr9k\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 332,
		"path": "../public/glyphs/pin.svg"
	},
	"/glyphs/profile.svg": {
		"type": "image/svg+xml",
		"etag": "\"1c4-Lci1J36I7x2DmTBmWdwMsyEir+w\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 452,
		"path": "../public/glyphs/profile.svg"
	},
	"/glyphs/plus.svg": {
		"type": "image/svg+xml",
		"etag": "\"c3-tyiHn52FMIB16FLm0kN3TM/Zqog\"",
		"mtime": "2026-11-26T10:36:10.827Z",
		"size": 195,
		"path": "../public/glyphs/plus.svg"
	},
	"/glyphs/school.svg": {
		"type": "image/svg+xml",
		"etag": "\"18b-eLWpb8dVG3AvKP/b3kdMG4U2pE4\"",
		"mtime": "2026-11-26T10:36:10.828Z",
		"size": 395,
		"path": "../public/glyphs/school.svg"
	},
	"/glyphs/share.svg": {
		"type": "image/svg+xml",
		"etag": "\"245-DNcsIEeNsYywzJtTz/c4FPXCm7M\"",
		"mtime": "2026-11-26T10:36:10.828Z",
		"size": 581,
		"path": "../public/glyphs/share.svg"
	},
	"/glyphs/shield.svg": {
		"type": "image/svg+xml",
		"etag": "\"18c-qd0KaGIfT2J8MbGu/eiUSv+0LuI\"",
		"mtime": "2026-11-26T10:36:10.828Z",
		"size": 396,
		"path": "../public/glyphs/shield.svg"
	},
	"/glyphs/sliders.svg": {
		"type": "image/svg+xml",
		"etag": "\"19f-Lepzzqfk/ABOOb+dZXpGy1EU2jg\"",
		"mtime": "2026-11-26T10:36:10.828Z",
		"size": 415,
		"path": "../public/glyphs/sliders.svg"
	},
	"/glyphs/signpost.svg": {
		"type": "image/svg+xml",
		"etag": "\"1f4-49H73j8V9Z0aZJ081yIMXMKTmsA\"",
		"mtime": "2026-11-26T10:36:10.828Z",
		"size": 500,
		"path": "../public/glyphs/signpost.svg"
	},
	"/glyphs/start.svg": {
		"type": "image/svg+xml",
		"etag": "\"1c0-D8/DG8jwUEaFv6yJuxVeEr+N1O8\"",
		"mtime": "2026-11-26T10:36:10.828Z",
		"size": 448,
		"path": "../public/glyphs/start.svg"
	},
	"/glyphs/timeline.svg": {
		"type": "image/svg+xml",
		"etag": "\"234-aNZmC2YwfJX29AEVQZLp0CiHSRY\"",
		"mtime": "2026-11-26T10:36:10.828Z",
		"size": 564,
		"path": "../public/glyphs/timeline.svg"
	},
	"/glyphs/search.svg": {
		"type": "image/svg+xml",
		"etag": "\"141-5PxfZ36KuOGg5GR0NdVkmYB4AcU\"",
		"mtime": "2026-11-26T10:36:10.828Z",
		"size": 321,
		"path": "../public/glyphs/search.svg"
	},
	"/glyphs/points.svg": {
		"type": "image/svg+xml",
		"etag": "\"1e2-7zTlM9c0oq0tdvpHzHhiuwITHvY\"",
		"mtime": "2026-11-26T10:36:10.828Z",
		"size": 482,
		"path": "../public/glyphs/points.svg"
	},
	"/glyphs/support.svg": {
		"type": "image/svg+xml",
		"etag": "\"1d1-WE1UZVDTjEbtgBG0j2AcB0vSc9I\"",
		"mtime": "2026-11-26T10:36:10.828Z",
		"size": 465,
		"path": "../public/glyphs/support.svg"
	},
	"/glyphs/sun.svg": {
		"type": "image/svg+xml",
		"etag": "\"19f-680R8RBvkeLeopf2JtNsadQzi1I\"",
		"mtime": "2026-11-26T10:36:10.828Z",
		"size": 415,
		"path": "../public/glyphs/sun.svg"
	},
	"/glyphs/trusted.svg": {
		"type": "image/svg+xml",
		"etag": "\"286-hMYbiXg0ioPkySiiZcwxoQpAxn4\"",
		"mtime": "2026-11-26T10:36:10.828Z",
		"size": 646,
		"path": "../public/glyphs/trusted.svg"
	},
	"/glyphs/vehicle.svg": {
		"type": "image/svg+xml",
		"etag": "\"349-Kp5I6SZy0/swHRSG2Q5+4kOS+zk\"",
		"mtime": "2026-11-26T10:36:10.828Z",
		"size": 841,
		"path": "../public/glyphs/vehicle.svg"
	},
	"/glyphs/work.svg": {
		"type": "image/svg+xml",
		"etag": "\"1bf-8a/eMM2SjpyOhft0ziJ2qE8CSkQ\"",
		"mtime": "2026-11-26T10:36:10.828Z",
		"size": 447,
		"path": "../public/glyphs/work.svg"
	},
	"/assets/ibm-plex-sans-latin-400-normal-CDDApCn2.woff2": {
		"type": "font/woff2",
		"etag": "\"583c-JIKJdEuBOmpyScxB1Wj6xAuBzn8\"",
		"mtime": "2026-11-26T10:36:10.461Z",
		"size": 22588,
		"path": "../public/assets/ibm-plex-sans-latin-400-normal-CDDApCn2.woff2"
	},
	"/glyphs/wheel.svg": {
		"type": "image/svg+xml",
		"etag": "\"170-k2Isvse94cFVNEVywjODIeN2jd8\"",
		"mtime": "2026-11-26T10:36:10.828Z",
		"size": 368,
		"path": "../public/glyphs/wheel.svg"
	},
	"/assets/ibm-plex-sans-latin-500-normal-6ng42L7E.woff2": {
		"type": "font/woff2",
		"etag": "\"5e78-TULHhbZFMSdm0F//zuV4e+2ICl8\"",
		"mtime": "2026-11-26T10:36:10.461Z",
		"size": 24184,
		"path": "../public/assets/ibm-plex-sans-latin-500-normal-6ng42L7E.woff2"
	},
	"/assets/ibm-plex-sans-latin-400-normal-CYLoc0-x.woff": {
		"type": "font/woff",
		"etag": "\"5658-7KxncOwX60mn/7d32puu2VRrcXc\"",
		"mtime": "2026-11-26T10:36:10.461Z",
		"size": 22104,
		"path": "../public/assets/ibm-plex-sans-latin-400-normal-CYLoc0-x.woff"
	},
	"/assets/ibm-plex-sans-latin-500-normal-BgVn5rGT.woff": {
		"type": "font/woff",
		"etag": "\"5d6c-6mSK/D3BOKVnM2TEjppmzbpb3bM\"",
		"mtime": "2026-11-26T10:36:10.461Z",
		"size": 23916,
		"path": "../public/assets/ibm-plex-sans-latin-500-normal-BgVn5rGT.woff"
	},
	"/assets/ibm-plex-sans-latin-ext-400-normal-C5H60-Va.woff2": {
		"type": "font/woff2",
		"etag": "\"3e6c-wj6Yd51oeo16SMeFqR5S1fRFjbU\"",
		"mtime": "2026-11-26T10:36:10.462Z",
		"size": 15980,
		"path": "../public/assets/ibm-plex-sans-latin-ext-400-normal-C5H60-Va.woff2"
	},
	"/assets/ibm-plex-sans-latin-600-normal-CuJfVYMP.woff2": {
		"type": "font/woff2",
		"etag": "\"5ebc-kNnCJpfajLJyKwke0lTtYXoO10o\"",
		"mtime": "2026-11-26T10:36:10.462Z",
		"size": 24252,
		"path": "../public/assets/ibm-plex-sans-latin-600-normal-CuJfVYMP.woff2"
	},
	"/assets/ibm-plex-sans-latin-ext-500-normal-D0aIdm-b.woff": {
		"type": "font/woff",
		"etag": "\"3990-bkK8QuMsH2oJhFmn0dVSmOwYK8g\"",
		"mtime": "2026-11-26T10:36:10.462Z",
		"size": 14736,
		"path": "../public/assets/ibm-plex-sans-latin-ext-500-normal-D0aIdm-b.woff"
	},
	"/assets/ibm-plex-sans-latin-ext-400-normal-RBey6euL.woff": {
		"type": "font/woff",
		"etag": "\"3818-PUohXneAvLWIcuS7SyJJPTWSRVA\"",
		"mtime": "2026-11-26T10:36:10.462Z",
		"size": 14360,
		"path": "../public/assets/ibm-plex-sans-latin-ext-400-normal-RBey6euL.woff"
	},
	"/assets/ibm-plex-sans-latin-600-normal-Cu4Hd6ag.woff": {
		"type": "font/woff",
		"etag": "\"5d44-30y9G0JG6op8xi1hIy2o+g60IIQ\"",
		"mtime": "2026-11-26T10:36:10.462Z",
		"size": 23876,
		"path": "../public/assets/ibm-plex-sans-latin-600-normal-Cu4Hd6ag.woff"
	},
	"/assets/ibm-plex-sans-latin-ext-600-normal-DIrixKbi.woff": {
		"type": "font/woff",
		"etag": "\"39b4-O15LDVIYlp7aWv/XWQRKcOV0vGE\"",
		"mtime": "2026-11-26T10:36:10.462Z",
		"size": 14772,
		"path": "../public/assets/ibm-plex-sans-latin-ext-600-normal-DIrixKbi.woff"
	},
	"/assets/ibm-plex-sans-latin-ext-500-normal-DakdToA3.woff2": {
		"type": "font/woff2",
		"etag": "\"4048-zM2hKwVRcOOkBzAtF9gSRifb1Xo\"",
		"mtime": "2026-11-26T10:36:10.462Z",
		"size": 16456,
		"path": "../public/assets/ibm-plex-sans-latin-ext-500-normal-DakdToA3.woff2"
	},
	"/assets/ibm-plex-sans-latin-ext-600-normal-DOrvGEcy.woff2": {
		"type": "font/woff2",
		"etag": "\"4040-LoT1batWuCCwsLJXNPobgf+1rYc\"",
		"mtime": "2026-11-26T10:36:10.462Z",
		"size": 16448,
		"path": "../public/assets/ibm-plex-sans-latin-ext-600-normal-DOrvGEcy.woff2"
	},
	"/assets/ibm-plex-serif-latin-400-normal-BB-zNvJB.woff": {
		"type": "font/woff",
		"etag": "\"4848-t8Am5cmVkF1V8GS7zCa08xesPPU\"",
		"mtime": "2026-11-26T10:36:10.462Z",
		"size": 18504,
		"path": "../public/assets/ibm-plex-serif-latin-400-normal-BB-zNvJB.woff"
	},
	"/assets/ibm-plex-serif-latin-ext-400-normal-DwktX9jl.woff": {
		"type": "font/woff",
		"etag": "\"35d4-wB/pHH6clOiMcqZlICBiSc422oc\"",
		"mtime": "2026-11-26T10:36:10.462Z",
		"size": 13780,
		"path": "../public/assets/ibm-plex-serif-latin-ext-400-normal-DwktX9jl.woff"
	},
	"/assets/ibm-plex-serif-latin-500-normal-C3_OdgN3.woff": {
		"type": "font/woff",
		"etag": "\"4c1c-pE2MBd8P6nzBeRGXHa5iwHwZ6Dw\"",
		"mtime": "2026-11-26T10:36:10.462Z",
		"size": 19484,
		"path": "../public/assets/ibm-plex-serif-latin-500-normal-C3_OdgN3.woff"
	},
	"/assets/ibm-plex-serif-latin-ext-400-normal-CNMooFZX.woff2": {
		"type": "font/woff2",
		"etag": "\"3c74-uVRRO3SotmgaIcq/2AmlMiSn2Ks\"",
		"mtime": "2026-11-26T10:36:10.462Z",
		"size": 15476,
		"path": "../public/assets/ibm-plex-serif-latin-ext-400-normal-CNMooFZX.woff2"
	},
	"/assets/ibm-plex-serif-latin-ext-500-normal-CmETpp4t.woff2": {
		"type": "font/woff2",
		"etag": "\"3c98-SzmfTslXEB3JJuma92KOAeLis78\"",
		"mtime": "2026-11-26T10:36:10.462Z",
		"size": 15512,
		"path": "../public/assets/ibm-plex-serif-latin-ext-500-normal-CmETpp4t.woff2"
	},
	"/assets/ibm-plex-serif-latin-400-normal-BIGslYFI.woff2": {
		"type": "font/woff2",
		"etag": "\"4c7c-IcPNyhMBGZ3SqqvQVRU3sfuOO6A\"",
		"mtime": "2026-11-26T10:36:10.462Z",
		"size": 19580,
		"path": "../public/assets/ibm-plex-serif-latin-400-normal-BIGslYFI.woff2"
	},
	"/assets/index-Bj4OXxGZ.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"98b-BbDGkX/w7AljfVzc0kNqgOCkQnQ\"",
		"mtime": "2026-11-26T10:36:10.462Z",
		"size": 2443,
		"path": "../public/assets/index-Bj4OXxGZ.css"
	},
	"/assets/ibm-plex-serif-latin-ext-500-normal-Czz10gBp.woff": {
		"type": "font/woff",
		"etag": "\"3634-/oJFpWCxCgEFuMbCZ+PRMhY0oug\"",
		"mtime": "2026-11-26T10:36:10.462Z",
		"size": 13876,
		"path": "../public/assets/ibm-plex-serif-latin-ext-500-normal-Czz10gBp.woff"
	},
	"/assets/ibm-plex-serif-latin-500-normal-REKAfBVG.woff2": {
		"type": "font/woff2",
		"etag": "\"4f54-lhcocFmxyNqR7rUgHE8cdxYPXQU\"",
		"mtime": "2026-11-26T10:36:10.462Z",
		"size": 20308,
		"path": "../public/assets/ibm-plex-serif-latin-500-normal-REKAfBVG.woff2"
	},
	"/assets/styles-9BwEzM5H.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"b101-fonfgVpAiOiJEDMTFEuDEhC6DG8\"",
		"mtime": "2026-11-26T10:36:10.463Z",
		"size": 45313,
		"path": "../public/assets/styles-9BwEzM5H.css"
	},
	"/assets/index-Cp_KtGVa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8c836-SMjKNI5wqKlsmIH8ZEsyaiKRaz0\"",
		"mtime": "2026-11-26T10:36:10.461Z",
		"size": 575542,
		"path": "../public/assets/index-Cp_KtGVa.js"
	},
	"/assets/routes-DvGGwnAk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"496eb-WBt3W2QcfzlmSDh9Ks7MJ498WYk\"",
		"mtime": "2026-11-26T10:36:10.461Z",
		"size": 300779,
		"path": "../public/assets/routes-DvGGwnAk.js"
	}
};
// #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
// #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
// ../node_modules/.bun/nitro@3.0.260610-beta+81b37bdc146c9514/node_modules/nitro/dist/runtime/internal/static.mjs
var METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
var EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
// #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_eGZhsN = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_eGZhsN
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
var globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
// ../node_modules/.bun/nitro@3.0.260610-beta+81b37bdc146c9514/node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
// #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
// #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		middleware.push(...h3App["~middleware"]);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
// ../node_modules/.bun/nitro@3.0.260610-beta+81b37bdc146c9514/node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
// ../node_modules/.bun/nitro@3.0.260610-beta+81b37bdc146c9514/node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
// #nitro/virtual/tracing
var tracingSrvxPlugins = [];
// ../node_modules/.bun/nitro@3.0.260610-beta+81b37bdc146c9514/node_modules/nitro/dist/presets/node/runtime/node-server.mjs
var _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
var port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
var host = process.env.NITRO_HOST || process.env.HOST;
var cert = process.env.NITRO_SSL_CERT;
var key = process.env.NITRO_SSL_KEY;
var nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch,
	plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
var node_server_default = {};
export { node_server_default as default };
