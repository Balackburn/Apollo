<p align="center">
  <img src="public/images/header/github_header.png" alt="Apollo for Reddit Banner" />
</p>

[![Platform](http://img.shields.io/badge/platform-iOS/iPadOS/macOS-blue.svg)](https://developer.apple.com/iphone/index.action)
![Release](https://img.shields.io/github/downloads/Balackburn/Apollo/total)
![GitHub issues](https://img.shields.io/github/issues-raw/Balackburn/Apollo)

# Apollo for Reddit with Apollo-Reborn

This AltStore source distributes [Apollo for Reddit (Christian Selig)](https://apolloapp.io/) powered by the [Apollo-Reborn](https://github.com/Apollo-Reborn/Apollo-Reborn) tweak.

> [!IMPORTANT]
> **ImprovedCustomApi is now [Apollo-Reborn](https://github.com/Apollo-Reborn/Apollo-Reborn).** The tweak is now community-maintained under the Apollo-Reborn org, which builds the official Apollo IPAs and runs its **own website and sources at [apolloreborn.app](https://apolloreborn.app)** (separate from this one).
>
> **This source and repo will keep working for everyone already using it.** The IPAs published here are Apollo-Reborn's official builds, mirrored to this repo's own [releases](https://github.com/Balackburn/Apollo/releases) so existing AltStore / SideStore / Feather subscribers keep auto-updating without changing anything.

The advertised version tracks the Apollo-Reborn tweak version. Before raising any issues, please check the [Apollo-Reborn](https://github.com/Apollo-Reborn/Apollo-Reborn/issues) repo first — as this source only distributes it.

## Getting a Reddit API Key

> [!WARNING]
> **Reddit no longer approves new API keys.** Applying through [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps) or the legacy Data API programme will almost always be denied, and Reddit has been running ban waves revoking existing keys that are recognisably tied to Apollo. Don't waste time on the official application forms — use the method below instead.

Since new keys can't be created, the current approach is to reuse the client ID from an accessibility-approved Reddit app:

1. Install [Dystopia for Reddit](https://apps.apple.com/us/app/dystopia-for-reddit/id1430599061) (iOS) or [RedReader](https://play.google.com/store/apps/details?id=org.quantumbadger.redreader) (Android).
2. Log in to it once with your Reddit account.
3. Reddit will send you an authorization email — copy the **App ID** from it.
4. In Apollo's **Custom API** settings, enter:

   | Field | Value |
   |-------|-------|
   | **Reddit API Key** | The App ID from the email |
   | **Redirect URI** | `dystopia://response` (Dystopia) or `redreader://rr_oauth_redir` (RedReader) |

The full walkthrough, including the correct User Agent strings, is kept up to date in the [Apollo-Reborn README](https://github.com/Apollo-Reborn/Apollo-Reborn#readme).

### Already have an old key?

- The key must be an **installed app** type — old **script** or **web app** keys will not let you log in.
- Keys whose settings don't mention Apollo have tended to survive the ban waves. Rename your app to something generic, change the redirect URI away from `apollo://reddit-oauth` to a personal scheme, and set a User Agent in Reddit's format (`ios:<your.bundle.id>:v1.0 (by /u/<your_username>)`) — personalize the values rather than copying examples verbatim.

### What about Imgur?

Imgur no longer issues new API keys either. Recent Apollo-Reborn builds ship with working Imgur integration out of the box, so no separate Imgur key setup is needed — see the [Apollo-Reborn README](https://github.com/Apollo-Reborn/Apollo-Reborn#readme) for details.

## Available Sources

| Version | Best For | Features |
|---------|----------|----------|
| **Standard** | Most users | Apollo injected with Apollo-Reborn |
| **No Extensions** | Free Apple Developer accounts | Apollo injected with Apollo-Reborn and removed extensions - Uses fewer App IDs (1 vs 7) |
| **GLASS** | iOS 26+ users | Apollo injected with Apollo-Reborn and Liquid Glass UI Patch (iOS 26+) |
| **No Extensions + LIQUID GLASS** | iOS 26 + Free accounts | Combines both options |

> [!NOTE]
> **Standard** and **No Extensions** keep Apollo's classic UIKit appearance, including the bottom-tab swipe-back gesture.
> The **GLASS** variants opt into the iOS 26 Liquid Glass redesign and bundle the Liquid Glass alternate-icon catalog — pick these only on iOS 26+.

## Standard Source

<a href="https://intradeus.github.io/http-protocol-redirector?r=altstore://source?url=https://raw.githubusercontent.com/Balackburn/Apollo/refs/heads/main/apps.json">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/buttons/DARK/Altstore.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/buttons/LIGHT/Altstore.png">
    <img alt="Add to AltStore" src="public/images/buttons/LIGHT/Altstore.png" height="55">
  </picture>
</a>
&nbsp;
<a href="https://intradeus.github.io/http-protocol-redirector?r=feather://source/https://raw.githubusercontent.com/Balackburn/Apollo/refs/heads/main/apps.json">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/buttons/DARK/Feather.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/buttons/LIGHT/Feather.png">
    <img alt="Add to Feather" src="public/images/buttons/LIGHT/Feather.png" height="55">
  </picture>
</a>
&nbsp;
<a href="https://intradeus.github.io/http-protocol-redirector?r=sidestore://source?url=https://raw.githubusercontent.com/Balackburn/Apollo/refs/heads/main/apps.json">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/buttons/DARK/Sidestore.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/buttons/LIGHT/Sidestore.png">
    <img alt="Add to SideStore" src="public/images/buttons/LIGHT/Sidestore.png" height="55">
  </picture>
</a>
&nbsp;
<a href="https://raw.githubusercontent.com/Balackburn/Apollo/refs/heads/main/apps.json">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/buttons/DARK/DirectURL.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/buttons/LIGHT/DirectURL.png">
    <img alt="Direct URL" src="public/images/buttons/LIGHT/DirectURL.png" height="55">
  </picture>
</a>

## No Extensions Source (Avoid AppID Limit)

<a href="https://intradeus.github.io/http-protocol-redirector?r=altstore://source?url=https://raw.githubusercontent.com/Balackburn/Apollo/refs/heads/main/apps_noext.json">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/buttons/DARK/Altstore.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/buttons/LIGHT/Altstore.png">
    <img alt="Add to AltStore" src="public/images/buttons/LIGHT/Altstore.png" height="55">
  </picture>
</a>
&nbsp;
<a href="https://intradeus.github.io/http-protocol-redirector?r=feather://source/https://raw.githubusercontent.com/Balackburn/Apollo/refs/heads/main/apps_noext.json">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/buttons/DARK/Feather.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/buttons/LIGHT/Feather.png">
    <img alt="Add to Feather" src="public/images/buttons/LIGHT/Feather.png" height="55">
  </picture>
</a>
&nbsp;
<a href="https://intradeus.github.io/http-protocol-redirector?r=sidestore://source?url=https://raw.githubusercontent.com/Balackburn/Apollo/refs/heads/main/apps_noext.json">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/buttons/DARK/Sidestore.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/buttons/LIGHT/Sidestore.png">
    <img alt="Add to SideStore" src="public/images/buttons/LIGHT/Sidestore.png" height="55">
  </picture>
</a>
&nbsp;
<a href="https://raw.githubusercontent.com/Balackburn/Apollo/refs/heads/main/apps_noext.json">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/buttons/DARK/DirectURL.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/buttons/LIGHT/DirectURL.png">
    <img alt="Direct URL" src="public/images/buttons/LIGHT/DirectURL.png" height="55">
  </picture>
</a>

## GLASS Source (iOS 26+)

<a href="https://intradeus.github.io/http-protocol-redirector?r=altstore://source?url=https://raw.githubusercontent.com/Balackburn/Apollo/refs/heads/main/apps_glass.json">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/buttons/DARK/Altstore.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/buttons/LIGHT/Altstore.png">
    <img alt="Add to AltStore" src="public/images/buttons/LIGHT/Altstore.png" height="55">
  </picture>
</a>
&nbsp;
<a href="https://intradeus.github.io/http-protocol-redirector?r=feather://source/https://raw.githubusercontent.com/Balackburn/Apollo/refs/heads/main/apps_glass.json">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/buttons/DARK/Feather.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/buttons/LIGHT/Feather.png">
    <img alt="Add to Feather" src="public/images/buttons/LIGHT/Feather.png" height="55">
  </picture>
</a>
&nbsp;
<a href="https://intradeus.github.io/http-protocol-redirector?r=sidestore://source?url=https://raw.githubusercontent.com/Balackburn/Apollo/refs/heads/main/apps_glass.json">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/buttons/DARK/Sidestore.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/buttons/LIGHT/Sidestore.png">
    <img alt="Add to SideStore" src="public/images/buttons/LIGHT/Sidestore.png" height="55">
  </picture>
</a>
&nbsp;
<a href="https://raw.githubusercontent.com/Balackburn/Apollo/refs/heads/main/apps_glass.json">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/buttons/DARK/DirectURL.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/buttons/LIGHT/DirectURL.png">
    <img alt="Direct URL" src="public/images/buttons/LIGHT/DirectURL.png" height="55">
  </picture>
</a>

## No Extensions + GLASS Source (Avoid AppID Limit - iOS 26+)

<a href="https://intradeus.github.io/http-protocol-redirector?r=altstore://source?url=https://raw.githubusercontent.com/Balackburn/Apollo/refs/heads/main/apps_noext_glass.json">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/buttons/DARK/Altstore.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/buttons/LIGHT/Altstore.png">
    <img alt="Add to AltStore" src="public/images/buttons/LIGHT/Altstore.png" height="55">
  </picture>
</a>
&nbsp;
<a href="https://intradeus.github.io/http-protocol-redirector?r=feather://source/https://raw.githubusercontent.com/Balackburn/Apollo/refs/heads/main/apps_noext_glass.json">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/buttons/DARK/Feather.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/buttons/LIGHT/Feather.png">
    <img alt="Add to Feather" src="public/images/buttons/LIGHT/Feather.png" height="55">
  </picture>
</a>
&nbsp;
<a href="https://intradeus.github.io/http-protocol-redirector?r=sidestore://source?url=https://raw.githubusercontent.com/Balackburn/Apollo/refs/heads/main/apps_noext_glass.json">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/buttons/DARK/Sidestore.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/buttons/LIGHT/Sidestore.png">
    <img alt="Add to SideStore" src="public/images/buttons/LIGHT/Sidestore.png" height="55">
  </picture>
</a>
&nbsp;
<a href="https://raw.githubusercontent.com/Balackburn/Apollo/refs/heads/main/apps_noext_glass.json">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/buttons/DARK/DirectURL.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/buttons/LIGHT/DirectURL.png">
    <img alt="Direct URL" src="public/images/buttons/LIGHT/DirectURL.png" height="55">
  </picture>
</a>

## Website

<a href="https://balackburn.github.io/Apollo">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/buttons/DARK/Website.png">
    <source media="(prefers-color-scheme: light)" srcset="public/images/buttons/LIGHT/Website.png">
    <img alt="Visit Website" src="public/images/buttons/LIGHT/Website.png" height="55">
  </picture>
</a>

##
This project is not affiliated with Apollo or Christian Selig.
