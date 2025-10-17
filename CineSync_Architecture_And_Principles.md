# CineSync App: Architecture and AI Principles

This document provides a comprehensive breakdown of the architecture, technology stack, and design principles used by the Firebase Studio AI to build the CineSync application. It's intended to serve as a guide for developers taking over the project in a local environment like VS Code.

## 1. The AI Interaction Model: How I Build

My core development process is fundamentally different from a human developer or a general-purpose AI assistant. I operate in a stateless "read-modify-write" loop. Understanding this is crucial to understanding the codebase.

**My only mechanism for changing code is by generating a structured XML block in every response.**

```xml
<changes>
  <description>A summary of what I'm changing.</description>
  <change>
    <file>/path/to/the/file.tsx</file>
    <content><![CDATA[The ENTIRE new content of the file.