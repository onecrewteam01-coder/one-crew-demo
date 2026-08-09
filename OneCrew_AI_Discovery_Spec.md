OneCrew AI Discovery & Startup Creation System

Product Specification (v1.0)

Purpose

The AI Discovery System is the first experience every founder has inside OneCrew.

Its goal is not to collect information like a traditional form. Instead, it should behave like an experienced
startup co-founder that listens, understands, infers information intelligently, and only asks questions
when necessary.

The onboarding experience should take 3–5 minutes while generating enough structured information to
automatically create a complete startup workspace.

Core Design Principles

1. Infer Before Asking

The AI should extract as much information as possible from the founder's first description.

If the AI already understands a topic with high confidence, it should not ask another question about it.

Example:

Founder writes:

“I'm building an AI-powered platform that helps university students prepare for interviews through mock
interviews and personalized feedback.”

The AI should automatically infer:

(cid:127) Industry ﬁ Education Technology
(cid:127) Product Type ﬁ AI SaaS
(cid:127) Users ﬁ Students
(cid:127) Platform ﬁ Web/Mobile
(cid:127) AI Usage ﬁ Required
(cid:127) Competitors ﬁ Interviewing.io, Pramp, etc.
(cid:127) Possible Revenue ﬁ Freemium/Subscription

Instead of asking obvious follow-up questions.

2. Use the Right Input Type

Choose the simplest input that captures the required information.

Large Text Box

Use when detailed context is required.

Examples:

(cid:127) Startup idea

(cid:127) MVP

(cid:127) Additional information

Multiple Choice

Use when most users fit predefined categories.

Examples:

(cid:127) Product type

(cid:127) Startup stage

(cid:127) Revenue model

(cid:127) Authentication

(cid:127) Database

(cid:127) Brand personality

Always include:

Other ﬁ Text Input

to handle unique requirements.

Multi-Select

Use when more than one answer is valid.

Examples:

(cid:127) Platforms

(cid:127) Brand styles

(cid:127) Preferred technologies

Optional Inputs

Only request information that is helpful but not essential.

Examples:

(cid:127) Preferred colors

(cid:127) Existing team

(cid:127) Budget

(cid:127) Existing codebase

Workflow

Step 1 — Startup Discovery

Objective

Understand the startup at a high level.

Input

Large text field.

Prompt:

“Tell us about your startup. Describe what you're building, who it's for, the problem it solves, how users
will use it, and any features you've already thought about.”

AI Extracts

Automatically determine:

(cid:127) Startup summary

(cid:127) Problem statement

(cid:127) Proposed solution

(cid:127) Industry

(cid:127) Product category

(cid:127) Target audience

(cid:127) Core workflow

(cid:127) Main features

(cid:127) Pain points

(cid:127) Product complexity

(cid:127) Keywords

(cid:127) Initial business model assumptions

AI Confidence

Assign confidence scores for:

(cid:127) Problem understanding

(cid:127) Target audience

(cid:127) Product category

(cid:127) Business model

(cid:127) Platform

(cid:127) Technical requirements

Missing information is requested later through targeted follow-up questions.

Step 2 — Competitive Advantage

Objective

Understand why customers should choose this startup.

Input

Text box.

Question:

“What makes your startup different from existing alternatives?”

Placeholder:

(cid:127) Better UX

(cid:127) Faster

(cid:127) Lower cost

(cid:127) AI-powered

(cid:127) More accurate

(cid:127) Better privacy

(cid:127) New technology

AI Generates

(cid:127) Unique Value Proposition (UVP)

(cid:127) Market positioning

(cid:127) Competitive advantages

(cid:127) Initial competitor assumptions

(cid:127) Innovation summary

Step 3 — MVP Planning

Objective

Understand what Version 1 should include.

Input

Large text field.

Question:

“Describe the smallest version of your product that delivers real value.”

Optional follow-up:

“What features can wait until future versions?”

AI Generates

(cid:127) MVP Definition

(cid:127) Feature priorities

(cid:127) Product backlog

(cid:127) User stories

(cid:127) Suggested roadmap

(cid:127) Development milestones

Step 4 — Startup Identity

Startup Name

n I already have one

n Generate names with AI

If a name exists, AI evaluates:

(cid:127) Memorability

(cid:127) Pronunciation

(cid:127) Brand fit

(cid:127) Domain availability

(cid:127) Similar company names

Brand Personality

Select up to three.

(cid:127) Modern

(cid:127) Premium

(cid:127) Minimal

(cid:127) Professional

(cid:127) Friendly

(cid:127) Bold

(cid:127) Futuristic

(cid:127) Trustworthy

(cid:127) Luxury

(cid:127) Innovative

(cid:127) Creative

(cid:127) Playful

(cid:127) Other _______

Preferred Colors (Optional)

(cid:127) Blue

(cid:127) Purple

(cid:127) Green

(cid:127) Red

(cid:127) Orange

(cid:127) Black

(cid:127) White

(cid:127) No Preference

(cid:127) Other _______

Optional

Brands you admire

Words you want customers to associate with your startup

AI Generates

(cid:127) Brand personality

(cid:127) Name suggestions (if needed)

(cid:127) Tagline

(cid:127) Color palette

(cid:127) Typography recommendations

(cid:127) Logo prompt

(cid:127) Brand voice

Step 5 — Product Configuration

Product Type

Select all that apply.

(cid:127) Web App

(cid:127) Mobile App

(cid:127) Desktop Application

(cid:127) AI Product

(cid:127) AI Agent

(cid:127) Hardware

(cid:127) API

(cid:127) Browser Extension

(cid:127) SaaS

(cid:127) Marketplace

(cid:127) Other _______

Target Customers

(cid:127) Consumers (B2C)

(cid:127) Businesses (B2B)

(cid:127) Both

(cid:127) Government

(cid:127) Internal Company Tool

(cid:127) Other _______

Startup Stage

(cid:127) Idea

(cid:127) Planning

(cid:127) Designing

(cid:127) Building MVP

(cid:127) Beta

(cid:127) Live

Step 6 — Technical Preferences

Preferred Stack

(cid:127) Let OneCrew Decide

(cid:127) Flutter

(cid:127) React

(cid:127) Next.js

(cid:127) Node.js

(cid:127) Python

(cid:127) Java

(cid:127) .NET

(cid:127) Other _______

AI Features

n Required

n Not Required

n Not Sure

Authentication

(cid:127) Email

(cid:127) Google

(cid:127) Apple

(cid:127) Microsoft

(cid:127) Phone Number

(cid:127) Passwordless

(cid:127) Not Required

(cid:127) Other _______

Database

(cid:127) Let OneCrew Decide

(cid:127) PostgreSQL

(cid:127) MySQL

(cid:127) MongoDB

(cid:127) Firebase

(cid:127) Supabase

(cid:127) SQLite

(cid:127) Other _______

Step 7 — Business

Revenue Model

(cid:127) Subscription

(cid:127) One-Time Purchase

(cid:127) Freemium

(cid:127) Marketplace Commission

(cid:127) Advertising

(cid:127) Enterprise Licensing

(cid:127) Services

(cid:127) Not Sure

(cid:127) Other _______

Step 8 — Additional Information

Large text field.

Optional.

Examples:

(cid:127) Existing codebase

(cid:127) Existing team

(cid:127) Budget limitations

(cid:127) Launch deadline

(cid:127) Compliance requirements

(cid:127) Hardware limitations

(cid:127) Performance requirements

(cid:127) Security requirements

(cid:127) Special requests

Adaptive AI Follow-up System

This is the intelligence layer that separates OneCrew from a normal onboarding form.

The AI should never ask every possible question.

Instead, it follows this process:

(cid:127) Analyze the founder's responses.

(cid:127) Extract structured information.

(cid:127) Score confidence for each category.

(cid:127) Ask follow-up questions only for categories with insufficient confidence.

(cid:127) Continue until confidence reaches the required threshold.

This ensures every founder experiences a personalized onboarding process.

Someone who writes a detailed startup description may answer only three or four questions.

Someone with a rough idea may answer a few additional follow-ups.

Startup Generation

After onboarding, OneCrew automatically creates:

Business

(cid:127) Executive Summary

(cid:127) Vision

(cid:127) Mission

(cid:127) Problem Statement

(cid:127) Solution Summary

(cid:127) Customer Personas

(cid:127) Lean Canvas

(cid:127) Unique Value Proposition

(cid:127) Revenue Strategy

(cid:127) Market Positioning

Branding

(cid:127) Startup Name (if needed)

(cid:127) Tagline

(cid:127) Brand Personality

(cid:127) Logo Prompt

(cid:127) Color Palette

(cid:127) Typography

(cid:127) Brand Guidelines

Product

(cid:127) Product Requirements Document (PRD)

(cid:127) MVP Definition

(cid:127) User Stories

(cid:127) Feature Backlog

(cid:127) Product Roadmap

(cid:127) Milestones

Engineering

(cid:127) Recommended Tech Stack

(cid:127) System Architecture

(cid:127) Database Schema

(cid:127) API Outline

(cid:127) Authentication Strategy

(cid:127) Deployment Strategy

(cid:127) Suggested Folder Structure

Project Management

(cid:127) Initial Task Board

(cid:127) Sprint Plan

(cid:127) Milestones

(cid:127) Priorities

(cid:127) Risk Register

(cid:127) Suggested Next Actions

Final User Journey

(cid:127) 1. Describe Startup Idea

(cid:127) 2. Explain Competitive Advantage

(cid:127) 3. Define MVP

(cid:127) 4. Confirm Startup Identity

(cid:127) 5. Configure Product

(cid:127) 6. Set Technical Preferences

(cid:127) 7. Define Business Model

(cid:127) 8. Add Optional Information

(cid:127) 9. AI Performs Analysis

(cid:127) 10. Follow-up Questions (Only If Needed)

(cid:127) 11. Startup Workspace Generated

(cid:127) 12. Dashboard Opens

Vision

The onboarding process should feel less like completing a questionnaire and more like collaborating
with an experienced co-founder.

By combining free-text responses, smart multiple-choice options, AI inference, and adaptive follow-up
questions, OneCrew can gather high-quality information in minutes while automatically generating a
startup workspace that is immediately ready for planning, design, and development.

