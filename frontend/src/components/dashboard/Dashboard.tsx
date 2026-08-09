'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Briefcase,
  Package,
  Palette,
  Megaphone,
  Target,
  Zap,
  Wrench,
  Lightbulb,
  ShieldCheck,
  LayoutDashboard,
  FileText,
  Flame,
  Rocket,
  BrushCleaning,
  Hourglass,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Home,
  Compass,
  User,
  CreditCard,
  Pin,
  Plus,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar, { AgentNode } from './Sidebar';
import {
  ApiCredentialsTable,
  DocumentTrackerTable,
  DocumentViewerModal,
  MilestoneItem,
  ApiCredentialItem,
  DocumentItem,
} from './ActivityTable';
import { ChatMessage, ChatMessageItem, WorkflowTriggersList, TriggerItem } from './Alerts';
import AgentChat, { AgentChatMessage } from './AgentChat';
import {
  ActionButton,
  CategoryPills,
  SearchInput,
  ChatInputForm,
  UploadDropzone,
} from './Controls';

interface DashboardProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Dashboard({ isSidebarOpen, onToggleSidebar }: DashboardProps) {
  // --- 1. Dashboard Structural State ---
  const [activeModule, setActiveModule] = useState<string>('actions');
  const [mainCardId, setMainCardId] = useState<string>('card-workspace-graph');
  
  // Custom side tray scrolling logic for absolute elements
  const [sideScrollY, setSideScrollY] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    // Count currently active side cards dynamically
    let sideCards = [...moduleConfig[activeModule]];
    if (sideCards.includes(mainCardId)) {
      sideCards = sideCards.filter(id => id !== mainCardId);
    }
    const sideCardsCount = sideCards.length;

    // Only enable scroll if there are MORE than 4 side cards
    if (sideCardsCount <= 4) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Left column represents side tray (300px wide boundary)
    if (x < 300) {
      const containerHeight = rect.height;
      const totalSideHeight = (sideCardsCount * 110) + ((sideCardsCount - 1) * 16) + 12;
      const maxScroll = Math.max(0, totalSideHeight - containerHeight + 20); // 20px padding at bottom
      
      setSideScrollY((prev) => {
        const nextScroll = prev + e.deltaY * 0.75;
        return Math.max(0, Math.min(nextScroll, maxScroll));
      });
    }
  };

  // Reset scroll position on switching modules or active main card
  useEffect(() => {
    setSideScrollY(0);
  }, [activeModule, mainCardId]);

  const [activeGraphView, setActiveGraphView] = useState<'graph' | 'list'>('graph');
  const [graphSearchQuery, setGraphSearchQuery] = useState('');
  const [graphCategoryFilter, setGraphCategoryFilter] = useState('All');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isGraphFullscreen, setIsGraphFullscreen] = useState(false);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);

  const graphContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = graphContainerRef.current;
    if (!container) return;

    const handleWheelRaw = (e: WheelEvent) => {
      e.preventDefault();
      
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      let zoomFactor = 1.1;
      if (e.ctrlKey) {
        zoomFactor = 1.05;
      }
      
      let newScale = zoomScale;
      if (e.deltaY < 0) {
        newScale = Math.min(zoomScale * zoomFactor, 2.0);
      } else {
        newScale = Math.max(zoomScale / zoomFactor, 0.4);
      }
      
      const factor = newScale / zoomScale;
      const nextX = mouseX - (mouseX - panOffset.x) * factor;
      const nextY = mouseY - (mouseY - panOffset.y) * factor;
      
      setZoomScale(newScale);
      setPanOffset({ x: nextX, y: nextY });
    };

    container.addEventListener('wheel', handleWheelRaw, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheelRaw);
    };
  }, [graphContainerRef.current, zoomScale, panOffset]);
  
  // --- 3. Interactive Agent Hub (Chat) State ---
  const [activeAgent, setActiveAgent] = useState<'context' | 'strategy' | 'architecture'>('context');
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([
    {
      id: 'msg-init-system',
      type: 'system',
      text: 'Multi-Agent framework initialized. Context, Strategy, and Architecture nodes online.',
    },
    {
      id: 'msg-init-agent',
      type: 'agent',
      agentKey: 'context',
      agentChar: 'C',
      agentName: 'Context Agent',
      time: '17:10',
      text: "Hello! I've loaded the startup profile directory. Ready to analyze context or structural payload metrics.",
    },
  ]);

  // --- 6. Interactive Document Vault State ---
  const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([
    { name: 'startup_pitch_deck_2026.pdf', category: 'business', size: '4.2 MB', date: 'Jul 18, 2026', status: 'INDEXED' },
    { name: 'system_architecture_spec_v2.md', category: 'execution', size: '384 KB', date: 'Jul 15, 2026', status: 'INDEXED' },
    { name: 'market_research_competitors.xlsx', category: 'marketing', size: '1.8 MB', date: 'Jul 12, 2026', status: 'INDEXED' },
    { name: 'security_compliance_policy.pdf', category: 'resources', size: '2.1 MB', date: 'Jul 10, 2026', status: 'INDEXED' },
    { name: 'financial_projections_q3_q4.csv', category: 'business', size: '512 KB', date: 'Jul 05, 2026', status: 'INDEXED' },
    { name: 'user_interview_transcripts.txt', category: 'product', size: '120 KB', date: 'Jul 02, 2026', status: 'INDEXED' },
    { name: 'brand_guidelines_v1.pdf', category: 'brand', size: '3.1 MB', date: 'Jul 01, 2026', status: 'INDEXED' },
    { name: 'sales_pipeline_spec.md', category: 'sales', size: '210 KB', date: 'Jun 28, 2026', status: 'INDEXED' },
    { name: 'vision_and_mission.md', category: 'foundation', size: '88 KB', date: 'Jun 20, 2026', status: 'INDEXED' },
  ]);


  // --- 7. Action Center State ---
  interface ActionItem {
    id: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    agent: string;
    desc: string;
    meta: string;
    actionKey: string;
    executed: boolean;
  }

  const [actionFilter, setActionFilter] = useState<string>('all');
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    {
      id: 'act-03',
      priority: 'medium' as const,
      title: 'Synchronize Financial Projections with Strategy Memory',
      agent: 'Strategy Agent',
      desc: 'Ingest uploaded document financial_projections_q3_q4.csv into Strategy Agent\'s context buffer to align SOM projections ($42M target).',
      meta: 'Estimated Impact: Medium | Time: ~3s',
      actionKey: 'sync-financials',
      executed: false,
    },
    {
      id: 'act-04',
      priority: 'low' as const,
      title: 'Run System Latency Optimization Routine',
      agent: 'System Operator',
      desc: 'Balance neural network node distribution to drop average cluster latency from 28ms to sub-15ms range.',
      meta: 'Estimated Impact: Maintenance | Time: ~2s',
      actionKey: 'optimize-latency',
      executed: false,
    },
  ]);


  // --- Actions Sub-card States ---
  interface TodayTask {
    id: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
    dueDate?: string;
  }

  const [todaysTasks, setTodaysTasks] = useState<TodayTask[]>([
    { id: 'tt-1', title: 'Review PRD', priority: 'high', completed: false, dueDate: 'Today' },
    { id: 'tt-2', title: 'User Interview #3', priority: 'medium', completed: false, dueDate: 'Tomorrow' },
    { id: 'tt-3', title: 'Update Roadmap', priority: 'medium', completed: false, dueDate: 'Friday' },
    { id: 'tt-4', title: 'Competitor Analysis', priority: 'low', completed: false, dueDate: 'No Due Date' },
    { id: 'tt-5', title: 'Finalize MVP Scope', priority: 'high', completed: false, dueDate: 'Today' },
  ]);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskFormTitle, setTaskFormTitle] = useState('');
  const [taskFormPriority, setTaskFormPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [taskFormDueDate, setTaskFormDueDate] = useState('Today');

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteFormTitle, setNoteFormTitle] = useState('');
  const [noteFormCategory, setNoteFormCategory] = useState('General');
  const [noteFormContent, setNoteFormContent] = useState('');

  const toggleTodayTask = (id: string) => {
    setTodaysTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddNewTask = (title: string, priority: 'high' | 'medium' | 'low', dueDate: string) => {
    const newTask: TodayTask = {
      id: `tt-${Date.now()}`,
      title: title.trim(),
      priority,
      completed: false,
      dueDate: dueDate.trim() || 'Today',
    };
    setTodaysTasks(prev => [newTask, ...prev]);
    logSystemMessage(`Added task: "${title.trim()}" (${priority.toUpperCase()})`);
  };

  interface NoteItem {
    id: string;
    title: string;
    category: string;
    updatedAt: string;
    summary?: string;
    pinned?: boolean;
  }

  const [notes, setNotes] = useState<NoteItem[]>([
    { id: 'note-1', title: 'Monetization Strategy Ideas', category: 'Business', updatedAt: '2h ago', summary: 'SaaS pricing tiers with monthly fee model.', pinned: true },
    { id: 'note-2', title: 'System Architecture Flow', category: 'Technical', updatedAt: '1d ago', summary: 'Message broker and Redis caching layers spec.', pinned: false },
    { id: 'note-3', title: 'Launch Campaign Channels', category: 'Marketing', updatedAt: '3d ago', summary: 'Targeting dev publications and newsletters.', pinned: false },
    { id: 'note-4', title: 'Compliance Checklists', category: 'Foundation', updatedAt: '5d ago', summary: 'Data protection and SOC2 initial checklists.', pinned: false },
  ]);

  const handleAddNewNote = (title: string, category: string, summary: string) => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: title.trim(),
      category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
      updatedAt: 'Just now',
      summary: summary.trim(),
      pinned: false,
    };
    setNotes(prev => [newNote, ...prev]);
    logSystemMessage(`Created a new workspace draft note: "${title.trim()}"`);
  };


  // --- 8c. Startup Execution OS States ---
  const [milestoneTasks, setMilestoneTasks] = useState([
    { id: 'task-1', title: 'Define database schemas & structures', dueDate: 'Aug 01, 2026', completed: true },
    { id: 'task-2', title: 'Build OAuth and authentication middleware', dueDate: 'Aug 05, 2026', completed: true },
    { id: 'task-3', title: 'Implement Core Dashboard OS Workspace', dueDate: 'Aug 12, 2026', completed: false },
    { id: 'task-4', title: 'Set up automated deployment pipeline', dueDate: 'Aug 18, 2026', completed: false },
  ]);

  const toggleMilestoneTask = (taskId: string) => {
    setMilestoneTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  // --- 8d. Workspace Graph States & Configurations ---
  interface GraphNode {
    id: string;
    name: string;
    category: 'Business' | 'Product' | 'Marketing' | 'Technical' | 'Resources' | 'Execution';
    status: 'STABLE' | 'ACTIVE' | 'IN_PROGRESS' | 'QUEUED';
    pct: number;
    x: number;
    y: number;
    desc: string;
    updates: string;
    docs: string[];
    modules: string[];
  }

  interface GraphRelation {
    source: string;
    target: string;
    type: 'Depends On' | 'Influences' | 'References' | 'Blocks' | 'Parent' | 'Child';
  }

  const graphNodes: GraphNode[] = [
    { id: 'business-strategy', name: 'Business Strategy', category: 'Business', status: 'STABLE', pct: 100, x: 230, y: 90, desc: 'Core business positioning, monetization channels, and market fit strategies.', updates: 'Verified monetization strategy & SaaS pricing structure.', docs: ['business_spec.md', 'financial_plan.xlsx'], modules: ['Business Vision'] },
    { id: 'market-research', name: 'Market Research', category: 'Business', status: 'STABLE', pct: 100, x: 100, y: 190, desc: 'Competitor profiles analysis and target audience segments mapping.', updates: 'Completed qualitative interviews with 50 early target users.', docs: ['competitor_matrix.pdf', 'user_feedback_summary.md'], modules: ['Business Vision', 'Discovery Core'] },
    { id: 'value-proposition', name: 'Value Proposition', category: 'Business', status: 'STABLE', pct: 90, x: 360, y: 190, desc: 'Core differentiation vectors, value drivers, and user pain points mapping.', updates: 'Polished brand statement for early marketing funnels.', docs: ['value_prop.md'], modules: ['Business Vision'] },
    { id: 'financial-plan', name: 'Financial Plan', category: 'Business', status: 'ACTIVE', pct: 70, x: 230, y: 290, desc: 'Startup runway model, pricing configurations, and burn-rate metrics.', updates: 'Adjusted target acquisition cost modeling parameters.', docs: ['financial_plan.xlsx'], modules: ['Business Vision', 'Startup Progress'] },
    { id: 'customer-personas', name: 'Customer Personas', category: 'Business', status: 'STABLE', pct: 100, x: 100, y: 290, desc: 'Archetypes of target buyers, user motivations, and workflow blockages.', updates: 'Finalized target profile templates for developers and managers.', docs: ['user_personas.md'], modules: ['Business Vision'] },
    { id: 'product-vision', name: 'Product Vision', category: 'Product', status: 'STABLE', pct: 100, x: 500, y: 90, desc: 'Long term product capability blueprint, UX design core philosophy.', updates: 'Updated core specs integration roadmap overview.', docs: ['product_blueprint.md'], modules: ['Core Specs'] },
    { id: 'prd', name: 'PRD', category: 'Product', status: 'ACTIVE', pct: 85, x: 500, y: 190, desc: 'Product Requirements Document highlighting target MVP modules.', updates: 'Defined technical endpoints and websocket messaging rules.', docs: ['prd_mvp_v1.md'], modules: ['Core Specs', 'Discovery Core'] },
    { id: 'mvp-plan', name: 'MVP Plan', category: 'Product', status: 'IN_PROGRESS', pct: 60, x: 630, y: 190, desc: 'Iterative timeline spec for beta build release features packaging.', updates: 'Scoped sprint targets for orchestrator logic block.', docs: ['mvp_plan_v1.md'], modules: ['Core Specs', 'Startup Progress'] },
    { id: 'tech-architecture', name: 'Tech Architecture', category: 'Technical', status: 'IN_PROGRESS', pct: 50, x: 500, y: 290, desc: 'System structural layout, database schema definition, API configurations.', updates: 'Configured Redis cache settings and postgres schemas.', docs: ['architecture_layout.md', 'db_schemas.sql'], modules: ['Discovery Core'] },
    { id: 'go-to-market', name: 'Go-To-Market', category: 'Marketing', status: 'QUEUED', pct: 30, x: 760, y: 90, desc: 'Launch acquisition targets, channel distribution and viral loops configuration.', updates: 'Identified developer newsletter partners.', docs: ['gtm_launch_spec.md'], modules: ['Startup Progress'] },
    { id: 'marketing', name: 'Marketing', category: 'Marketing', status: 'QUEUED', pct: 20, x: 760, y: 290, desc: 'Outreach workflows, landing page lead acquisition setups, visual elements.', docs: ['marketing_timeline.md'], modules: ['Startup Progress'], updates: 'Drafted landing page copy specs.' },
    { id: 'sales-strategy', name: 'Sales Strategy', category: 'Marketing', status: 'QUEUED', pct: 15, x: 630, y: 290, desc: 'B2B onboarding pipelines, pipeline funnels, and enterprise outreach parameters.', updates: 'Drafted pricing sheet layouts for enterprise packages.', docs: ['sales_spec.md'], modules: ['Startup Progress'] },
    { id: 'brand-identity', name: 'Brand Identity', category: 'Marketing', status: 'ACTIVE', pct: 75, x: 760, y: 190, desc: 'Visual language guidelines, design palette choices, typography definitions.', updates: 'Approved visual guide and logo templates.', docs: ['brand_guidelines.pdf'], modules: ['Core Specs'] },
    { id: 'funding', name: 'Funding', category: 'Resources', status: 'QUEUED', pct: 40, x: 100, y: 390, desc: 'Investor outreach tracking lists, pitch deck iterations, round configurations.', updates: 'Updated pre-seed pitch slides deck.', docs: ['pitch_deck.pdf'], modules: ['Startup Progress'] },
    { id: 'legal', name: 'Legal & Compliance', category: 'Resources', status: 'STABLE', pct: 95, x: 230, y: 490, desc: 'Terms of service templates, data safety standards, corporate filings.', updates: 'Registered LLC and setup privacy policy framework.', docs: ['tos_draft.md', 'privacy_policy.md'], modules: ['Startup Progress'] },
    { id: 'resources-vault', name: 'Resources Vault', category: 'Resources', status: 'STABLE', pct: 90, x: 360, y: 390, desc: 'Asset files registry, vendor licenses list, credentials vaults.', updates: 'Verified API service accounts access.', docs: ['vendor_manifest.json'], modules: ['Startup Progress'] },
    { id: 'execution-pipeline', name: 'Execution Pipeline', category: 'Execution', status: 'IN_PROGRESS', pct: 45, x: 500, y: 390, desc: 'Sprint task trackers, automated CI/CD statuses, development pipeline.', updates: 'Fixed deployment script error for staging cluster.', docs: ['deploy_spec.yml'], modules: ['Startup Progress', 'Discovery Core'] },
  ];

  const graphRelations: GraphRelation[] = [
    { source: 'market-research', target: 'business-strategy', type: 'Depends On' },
    { source: 'customer-personas', target: 'market-research', type: 'Parent' },
    { source: 'value-proposition', target: 'business-strategy', type: 'Depends On' },
    { source: 'financial-plan', target: 'business-strategy', type: 'Child' },
    { source: 'product-vision', target: 'business-strategy', type: 'Influences' },
    { source: 'prd', target: 'product-vision', type: 'Depends On' },
    { source: 'mvp-plan', target: 'prd', type: 'Depends On' },
    { source: 'tech-architecture', target: 'prd', type: 'Depends On' },
    { source: 'tech-architecture', target: 'mvp-plan', type: 'Influences' },
    { source: 'execution-pipeline', target: 'tech-architecture', type: 'Depends On' },
    { source: 'execution-pipeline', target: 'mvp-plan', type: 'Depends On' },
    { source: 'resources-vault', target: 'execution-pipeline', type: 'References' },
    { source: 'go-to-market', target: 'value-proposition', type: 'Depends On' },
    { source: 'brand-identity', target: 'product-vision', type: 'References' },
    { source: 'marketing', target: 'brand-identity', type: 'Depends On' },
    { source: 'marketing', target: 'go-to-market', type: 'Child' },
    { source: 'sales-strategy', target: 'go-to-market', type: 'Child' },
    { source: 'funding', target: 'financial-plan', type: 'Depends On' },
    { source: 'legal', target: 'funding', type: 'Blocks' },
    { source: 'resources-vault', target: 'funding', type: 'References' },
  ];


  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const target = e.target as SVGElement;
    if (target.tagName === 'svg' || target.id === 'canvas-grid' || target.id === 'canvas-bg' || target.id === 'graph-canvas-svg') {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    const target = e.target as SVGElement;
    if (target.tagName === 'svg' || target.id === 'canvas-grid' || target.id === 'canvas-bg' || target.id === 'graph-canvas-svg') {
      const touch = e.touches[0];
      setIsDraggingCanvas(true);
      setDragStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent) => {
    if (isDraggingCanvas) {
      const touch = e.touches[0];
      setPanOffset({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  const handleCanvasTouchEnd = () => {
    setIsDraggingCanvas(false);
  };

  const adjustZoomAroundCenter = (newScale: number) => {
    const viewWidth = graphContainerRef.current?.clientWidth || 800;
    const viewHeight = graphContainerRef.current?.clientHeight || 500;
    const cx = viewWidth / 2;
    const cy = viewHeight / 2;
    
    const factor = newScale / zoomScale;
    const nextX = cx - (cx - panOffset.x) * factor;
    const nextY = cy - (cy - panOffset.y) * factor;
    
    setZoomScale(newScale);
    setPanOffset({ x: nextX, y: nextY });
  };

  const handleZoomIn = () => {
    const newScale = Math.min(zoomScale * 1.1, 2.0);
    adjustZoomAroundCenter(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(zoomScale / 1.1, 0.4);
    adjustZoomAroundCenter(newScale);
  };

  const handleFitGraph = () => {
    const activeNodes = graphNodes.filter(n => !collapsedGroups.includes(n.category));
    if (activeNodes.length === 0) {
      setPanOffset({ x: 0, y: 0 });
      setZoomScale(0.82);
      return;
    }
    
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    activeNodes.forEach(node => {
      if (node.x < minX) minX = node.x;
      if (node.x > maxX) maxX = node.x;
      if (node.y < minY) minY = node.y;
      if (node.y > maxY) maxY = node.y;
    });
    
    const graphWidth = (maxX - minX) || 100;
    const graphHeight = (maxY - minY) || 100;
    
    const viewWidth = graphContainerRef.current?.clientWidth || 800;
    const viewHeight = graphContainerRef.current?.clientHeight || 500;
    
    const newScale = 0.82; // Force exactly 82% zoom on center/fit
    
    const graphCenterX = minX + graphWidth / 2;
    const graphCenterY = minY + graphHeight / 2;
    
    const viewCenterX = viewWidth / 2;
    const viewCenterY = viewHeight / 2;
    
    const offsetX = viewCenterX - graphCenterX * newScale;
    const offsetY = viewCenterY - graphCenterY * newScale;
    
    setZoomScale(newScale);
    setPanOffset({ x: offsetX, y: offsetY });
  };

  const handleCenterGraph = () => {
    const activeNodes = graphNodes.filter(n => !collapsedGroups.includes(n.category));
    if (activeNodes.length === 0) return;
    
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    activeNodes.forEach(node => {
      if (node.x < minX) minX = node.x;
      if (node.x > maxX) maxX = node.x;
      if (node.y < minY) minY = node.y;
      if (node.y > maxY) maxY = node.y;
    });
    
    const graphCenterX = minX + (maxX - minX) / 2;
    const graphCenterY = minY + (maxY - minY) / 2;
    
    const viewWidth = graphContainerRef.current?.clientWidth || 800;
    const viewHeight = graphContainerRef.current?.clientHeight || 500;
    
    const viewCenterX = viewWidth / 2;
    const viewCenterY = viewHeight / 2;
    
    const offsetX = viewCenterX - graphCenterX * zoomScale;
    const offsetY = viewCenterY - graphCenterY * zoomScale;
    
    setPanOffset({ x: offsetX, y: offsetY });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isGraphFullscreen) {
        setIsGraphFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGraphFullscreen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFitGraph();
    }, 150);
    return () => clearTimeout(timer);
  }, [isGraphFullscreen]);

  const getConnectedNodesAndEdges = (nodeId: string | null) => {
    if (!nodeId) return { nodeIds: new Set<string>(), edgeKeys: new Set<string>() };
    const visitedNodes = new Set<string>([nodeId]);
    const visitedEdges = new Set<string>();
    
    const adj: Record<string, { target: string; edgeKey: string }[]> = {};
    graphNodes.forEach(n => { adj[n.id] = []; });
    
    graphRelations.forEach(r => {
      const key = `${r.source}_${r.target}`;
      if (adj[r.source]) adj[r.source].push({ target: r.target, edgeKey: key });
      if (adj[r.target]) adj[r.target].push({ target: r.source, edgeKey: key });
    });
    
    const queue = [nodeId];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      const neighbors = adj[curr] || [];
      neighbors.forEach(neigh => {
        if (!visitedNodes.has(neigh.target)) {
          visitedNodes.add(neigh.target);
          visitedEdges.add(neigh.edgeKey);
          queue.push(neigh.target);
        } else {
          visitedEdges.add(neigh.edgeKey);
        }
      });
    }
    return { nodeIds: visitedNodes, edgeKeys: visitedEdges };
  };

  // --- Constants and configurations ---
  const agentsRegistry: AgentNode[] = [
    { key: 'context', name: 'Context Agent', char: 'C', status: 'ONLINE', role: 'Context Vector Ingestion', scope: 'Business Vision & Market Spec' },
    { key: 'strategy', name: 'Strategy Agent', char: 'S', status: 'ONLINE', role: 'Business Milestone Mapping', scope: 'Competitive Advantage Edge' },
    { key: 'architecture', name: 'Architecture Agent', char: 'A', status: 'ONLINE', role: 'Sync Build Matrices Compiler', scope: 'Workspace Payload' },
  ];

  const agentAnswers = {
    context: { name: 'Context Agent', char: 'C', intro: "Hello! I've loaded the startup profile directory. Ready to analyze context or structural payload metrics." },
    strategy: { name: 'Strategy Agent', char: 'S', intro: "Greetings. Node online. Ready to map MVP phases, competitor vectors, or business vision blueprints." },
    architecture: { name: 'Architecture Agent', char: 'A', intro: "System architect active. Ready to build sync targets, compile workspace graphs, or resolve backend payloads." }
  };

   const moduleConfig: Record<string, string[]> = {
    progress: ['card-startup-roadmap', 'card-milestone-tracker', 'card-startup-progress', 'card-launch-readiness'],
    documents: ['card-doc-vault', 'card-doc-foundation', 'card-doc-business', 'card-doc-product', 'card-doc-brand', 'card-doc-marketing', 'card-doc-sales', 'card-doc-execution', 'card-doc-resources'],
    actions: ['card-workspace-graph', 'card-action-recommendations', 'card-action-missing-info', 'card-action-todays-tasks', 'card-action-recent-notes', 'card-action-triggers', 'card-action-priority']
  };

  // Human-readable labels for mobile card picker chips
  const cardLabels: Record<string, string> = {
    'card-workspace-graph':       'Graph',
    'card-action-recommendations':'Next Steps',
    'card-action-missing-info':   'Missing Info',
    'card-action-todays-tasks':   'Tasks',
    'card-action-recent-notes':   'Notes',
    'card-action-triggers':       'Triggers',
    'card-action-priority':       'Priority',
    'card-startup-roadmap':       'Roadmap',
    'card-milestone-tracker':     'Milestones',
    'card-startup-progress':      'Progress',
    'card-launch-readiness':      'Launch',
    'card-doc-vault':             'All Docs',
    'card-doc-foundation':        'Foundation',
    'card-doc-business':          'Business',
    'card-doc-product':           'Product',
    'card-doc-brand':             'Brand',
    'card-doc-marketing':         'Marketing',
    'card-doc-sales':             'Sales',
    'card-doc-execution':         'Execution',
    'card-doc-resources':         'Resources',
  };

  const allCardIds = [
    'card-doc-vault', 'card-doc-foundation', 'card-doc-business', 'card-doc-product', 'card-doc-brand', 'card-doc-marketing', 'card-doc-sales', 'card-doc-execution', 'card-doc-resources',
    'card-action-recommendations', 'card-action-missing-info', 'card-action-todays-tasks', 'card-action-recent-notes', 'card-action-triggers', 'card-action-priority',
    'card-startup-roadmap', 'card-milestone-tracker', 'card-startup-progress', 'card-launch-readiness',
    'card-workspace-graph',
    'card-workspace-graph-side'
  ];



  // --- Helper to append messages ---
  const logSystemMessage = (text: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-sys-${Date.now()}`,
        type: 'system',
        text,
      },
    ]);
  };

  const logAgentMessage = (agentKey: 'context' | 'strategy' | 'architecture', text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const agent = agentAnswers[agentKey];

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-agent-${Date.now()}`,
        type: 'agent',
        agentKey,
        agentChar: agent.char,
        agentName: agent.name,
        time,
        text,
      },
    ]);
  };

  const handleChatSubmit = (query: string) => {
    // Add user message
    const userMsg: ChatMessageItem = {
      id: `msg-user-${Date.now()}`,
      type: 'user',
      text: query,
    };
    setChatMessages((prev) => [...prev, userMsg]);

    // Simulate Agent response
    setTimeout(() => {
      let targetAgent = activeAgent;
      let reply = "";
      
      if (query.includes('/analyze')) {
        targetAgent = 'context';
        reply = "Ingesting workspace profile logs... Found active payload modules. Cross-referencing confidence levels: Problem Understanding is high (95%). All schemas match backend definitions. Ready for strategy synthesis.";
      } else if (query.includes('/build')) {
        targetAgent = 'architecture';
        reply = "Initializing sync build for 'demo_profile'. Output maps configured. Emitting JSON manifest to workspace logs. Status: Completed compilation of MVP Architecture Node.";
      } else if (query.includes('/optimize')) {
        targetAgent = 'strategy';
        reply = "Latency metrics optimization routine launched. Routing pipeline through edge server tunnels. Core distribution balanced (9 nodes active). Expected latency decrease: ~12ms.";
      } else {
        reply = `Instruction received: "${query}". Processing in the cluster log lines. Let me know if you would like me to output the build payload or verify step status next.`;
      }

      logAgentMessage(targetAgent, reply);
    }, 600);
  };

  // Switch agent tab inside Agent Hub
  const handleSelectAgent = (agentKey: string) => {
    const key = agentKey as 'context' | 'strategy' | 'architecture';
    if (key === activeAgent) return;
    setActiveAgent(key);
    logSystemMessage(`${agentAnswers[key].name} activated.`);
    setTimeout(() => {
      logAgentMessage(key, agentAnswers[key].intro);
    }, 450);
  };

  // --- Dynamic Layout Position Mapping ---
  const getCardPositionClass = (cardId: string) => {
    if (cardId === mainCardId) return 'pos-main';
    
    let sideCards = [...moduleConfig[activeModule]];
    
    if (sideCards.includes(mainCardId)) {
      sideCards = sideCards.filter(id => id !== mainCardId);
    }
    
    const idx = sideCards.indexOf(cardId);
    if (idx !== -1) {
      return `pos-side-${idx + 1}`;
    }
    return 'pos-hidden';
  };

  const handleCardClick = (cardId: string, e: React.MouseEvent) => {
    // If it's already the main card, or is clicked inside a form/button/input, ignore
    const target = e.target as HTMLElement;
    if (cardId === mainCardId) return;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('form') ||
      target.closest('pre') ||
      target.closest('select') ||
      target.closest('.clickable-module-card')
    ) {
      return;
    }

    setMainCardId(cardId);
  };

  // --- Navigation module change ---
  const handleModuleChange = (moduleKey: string) => {
    if (moduleKey === activeModule) return;
    setActiveModule(moduleKey);
    if (moduleKey === 'progress') {
      setMainCardId('card-startup-roadmap');
    } else if (moduleKey === 'documents') {
      setMainCardId('card-doc-vault');
    } else if (moduleKey === 'actions') {
      setMainCardId('card-workspace-graph');
    }
  };

  // --- Global Clickable Workspace Module ---
  const handleSelectWorkspaceModule = (moduleKey: string) => {
    const formattedKey = moduleKey.toUpperCase();
    logSystemMessage(`Selected Workspace Module Domain: [${formattedKey}]`);
    
    if (activeAgent !== 'context') {
      setActiveAgent('context');
    }
    
    setTimeout(() => {
      logAgentMessage(
        'context',
        `Domain [${formattedKey}] loaded into active memory buffer. Inspecting section parameters, milestones, and linked agent tasks...`
      );
    }, 300);
  };

  // --- Document Ingestion ---
  const handleIngestDocument = (fileName: string, fileSize: string, forceCategory?: string) => {
    const timeStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const ext = fileName.split('.').pop()?.toUpperCase() || '';
    let tagCategory = forceCategory || 'business';

    if (!forceCategory) {
      if (['MD', 'JSON', 'JS', 'TS', 'TSX', 'PY'].includes(ext)) {
        tagCategory = 'execution';
      } else if (['XLSX', 'CSV'].includes(ext)) {
        tagCategory = 'business';
      }
    }

    const newDoc: DocumentItem = {
      name: fileName,
      category: tagCategory,
      size: fileSize,
      date: timeStr,
      status: 'INDEXED',
    };

    setDocuments((prev) => [newDoc, ...prev]);
    logSystemMessage(`Document ingested: "${fileName}" (${fileSize}) → [${tagCategory.toUpperCase()}] vault. Indexed into Onecrew context memory.`);
  };

  // --- Action Center Execution ---
  const handleExecuteAction = (actionId: string) => {
    setActionItems((prev) =>
      prev.map((item) => {
        if (item.id === actionId) {
          const updated = { ...item, executed: true };
          


          logSystemMessage(`Executed Action: "${item.title}". Workspace telemetry & agent logs updated.`);

          return updated;
        }
        return item;
      })
    );
  };


  // Action count helper
  const pendingActionsCount = actionItems.filter((i) => !i.executed).length;

  // Calculations for Startup Execution OS
  const completedTasksCount = milestoneTasks.filter(t => t.completed).length;
  const totalTasksCount = milestoneTasks.length;
  const milestoneProgress = Math.round((completedTasksCount / totalTasksCount) * 100);

  const radius = 32;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (milestoneProgress / 100) * circumference;

  const calculatedGrowthProgress = 58 + Math.round((milestoneProgress / 100) * 16); // ranges from 58% to 74%
  const launchReadinessScore = 70 + Math.round((milestoneProgress / 100) * 6); // ranges from 70% to 76%

  const points = [
    { x: 20, y: 100, label: 'Feb' },
    { x: 100, y: 88, label: 'Mar' },
    { x: 180, y: 73, label: 'Apr' },
    { x: 260, y: 64, label: 'May' },
    { x: 340, y: 56, label: 'Jun' },
    { x: 420, y: 110 - (calculatedGrowthProgress / 100) * 90, label: 'Jul' }
  ];
  const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length-1].x} 115 L ${points[0].x} 115 Z`;

  return (
    <div 
      className="dashboard-layout-container relative w-full min-h-0"
    >
      <div
        ref={containerRef}
        onWheel={handleWheel}
        style={{ '--side-scroll-y': `${sideScrollY}px` } as React.CSSProperties}
        className={`dashboard-content main-workspace relative h-full min-h-0 ${
          isSidebarOpen ? 'sidebar-open' : ''
        } ${
          moduleConfig[activeModule].length === 1 ? 'no-side-cards' : ''
        }`}
      >

        {/* ── Mobile Card Picker Strip (visible only on mobile ≤ 900px) ── */}
        <div className="hidden max-[900px]:flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-2.5 bg-[#050507] border-b border-[#141416] shrink-0 sticky top-0 z-20">
          {moduleConfig[activeModule].map((cardId) => (
            <button
              key={cardId}
              onClick={() => setMainCardId(cardId)}
              className={`shrink-0 font-mono text-[11px] font-bold h-8 px-3.5 rounded-full border transition-all cursor-pointer ${
                mainCardId === cardId
                  ? 'bg-white text-black border-white'
                  : 'bg-[#0c0c0e] text-[#888888] border-[#1e1e22] hover:text-white hover:border-white/30'
              }`}
            >
              {cardLabels[cardId] || cardId}
            </button>
          ))}
        </div>


          {/* ==================== 16. Document Vault (Overview) ==================== */}
          <div
            id="card-doc-vault"
            className={`card ${getCardPositionClass('card-doc-vault')}`}
            onClick={(e) => handleCardClick('card-doc-vault', e)}
          >
            <div className="card-preview">
              <div className="preview-header flex items-center justify-between gap-3">
                <div className="preview-title-group min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-[#888888]">DOCS // VAULT</span>
                  <h3 className="truncate">Document Vault</h3>
                </div>
                <span className="shrink-0 font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-white text-black whitespace-nowrap">
                  {documents.length} DOCS
                </span>
              </div>
              <div className="preview-body">
                <p className="preview-log-text">Latest: {documents[0]?.name || 'No docs uploaded'}</p>
              </div>
            </div>

            <div className="card-main">
              <div className="main-header">
                <div className="main-title-group">
                  <h2>Document Vault</h2>
                  <p>All documents uploaded across every domain vault.</p>
                </div>
              </div>
              <div className="main-body flex-grow overflow-y-auto flex flex-col gap-4">
                {viewingDoc ? (
                  <DocumentViewerModal
                    doc={viewingDoc}
                    onClose={() => setViewingDoc(null)}
                  />
                ) : (
                  <>
                    <UploadDropzone onUpload={handleIngestDocument} />
                    <DocumentTrackerTable
                      items={documents}
                      onView={(doc) => setViewingDoc(doc)}
                    />
                  </>
                )}
              </div>
            </div>
          </div>


          {/* ==================== 17–24. Document Category Cards ==================== */}
          {([
            { cat: 'foundation', cardId: 'card-doc-foundation', icon: Building2, label: 'Foundation', sub: 'DOCS // FOUNDATION' },
            { cat: 'business',   cardId: 'card-doc-business',   icon: Briefcase,  label: 'Business',   sub: 'DOCS // BUSINESS'   },
            { cat: 'product',    cardId: 'card-doc-product',    icon: Package,    label: 'Product',    sub: 'DOCS // PRODUCT'    },
            { cat: 'brand',      cardId: 'card-doc-brand',      icon: Palette,    label: 'Brand',      sub: 'DOCS // BRAND'      },
            { cat: 'marketing',  cardId: 'card-doc-marketing',  icon: Megaphone,  label: 'Marketing',  sub: 'DOCS // MARKETING'  },
            { cat: 'sales',      cardId: 'card-doc-sales',      icon: Target,     label: 'Sales',      sub: 'DOCS // SALES'      },
            { cat: 'execution',  cardId: 'card-doc-execution',  icon: Zap,        label: 'Execution',  sub: 'DOCS // EXECUTION'  },
            { cat: 'resources',  cardId: 'card-doc-resources',  icon: Wrench,     label: 'Resources',  sub: 'DOCS // RESOURCES'  },
          ] as const).map(({ cat, cardId, icon: Icon, label, sub }) => {
            const catDocs = documents.filter(d => d.category === cat);
            return (
              <div
                key={cardId}
                id={cardId}
                className={`card ${getCardPositionClass(cardId)}`}
                onClick={(e) => handleCardClick(cardId, e)}
              >
                <div className="card-preview">
                  <div className="preview-header flex items-center justify-between gap-3">
                    <div className="preview-title-group min-w-0 flex-1">
                      <span className="font-mono text-[10px] font-bold tracking-wider text-[#888888]">{sub}</span>
                      <h3 className="truncate">{label}</h3>
                    </div>
                    <span className="shrink-0 font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-white text-black whitespace-nowrap">
                      {catDocs.length} DOCS
                    </span>
                  </div>
                  <div className="preview-body">
                    <p className="preview-log-text">{catDocs[0]?.name || 'No docs yet'}</p>
                  </div>
                </div>

                <div className="card-main">
                  <div className="main-header">
                    <div className="main-title-group">
                      <h2 className="flex items-center gap-2">
                        <Icon size={18} strokeWidth={1.8} className="shrink-0 text-slate-300" />
                        {label} Vault
                      </h2>
                      <p>All {label.toLowerCase()} documents indexed in this domain vault.</p>
                    </div>
                  </div>
                  <div className="main-body flex-grow overflow-y-auto flex flex-col gap-3">
                    {viewingDoc && viewingDoc.category === cat ? (
                      <DocumentViewerModal
                        doc={viewingDoc}
                        onClose={() => setViewingDoc(null)}
                      />
                    ) : (
                      <DocumentTrackerTable
                        items={catDocs}
                        onView={(doc) => setViewingDoc(doc)}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}



          {/* ==================== 20. Action Center recommended actions ==================== */}
          <div
            id="card-action-recommendations"
            className={`card ${getCardPositionClass('card-action-recommendations')}`}
            onClick={(e) => handleCardClick('card-action-recommendations', e)}
          >
            <div className="card-preview">
              <div className="preview-header flex items-center justify-between gap-3">
                <div className="preview-title-group min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-[#888888]">ACTIONS // NEXT</span>
                  <h3 className="truncate">Next Steps</h3>
                </div>
                <span className="shrink-0 font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-white text-black whitespace-nowrap">
                  {pendingActionsCount} PENDING
                </span>
              </div>
              <div className="preview-body">
                <p className="preview-log-text">Top: Compile Step 4 Sync Build</p>
              </div>
            </div>

            <div className="card-main">
              <div className="main-header">
                <div className="main-title-group">
                  <h2>Action Center - Recommended Next Steps</h2>
                  <p>AI-synthesized priority action items calculated from system health, MVP steps, and agent telemetry.</p>
                </div>
              </div>
              <div className="main-body flex-grow overflow-y-auto flex flex-col gap-3">
                <CategoryPills
                  categories={[
                    { label: `All Actions (${actionItems.length})`, value: 'all' },
                    { label: `High Priority (${actionItems.filter(i => i.priority === 'high').length})`, value: 'high' },
                    { label: `Medium (${actionItems.filter(i => i.priority === 'medium').length})`, value: 'medium' },
                    { label: `Low (${actionItems.filter(i => i.priority === 'low').length})`, value: 'low' },
                  ]}
                  selectedValue={actionFilter}
                  onChange={setActionFilter}
                />
                
                <div className="flex flex-col gap-3">
                  {actionItems
                    .filter((item) => actionFilter === 'all' || item.priority === actionFilter)
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`bg-[#08080b] border border-[#141416] p-4 rounded-lg flex flex-col gap-2.5 transition-opacity duration-300 ${
                          item.executed ? 'opacity-60' : 'hover:border-neutral-500'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded ${
                                item.priority === 'high'
                                  ? 'bg-white text-black'
                                  : item.priority === 'medium'
                                  ? 'border border-[#888888] text-white'
                                  : 'border border-[#141416] text-[#888888]'
                              }`}
                            >
                              {item.priority.toUpperCase()} PRIORITY
                            </span>
                            <h3 className="font-mono text-xs sm:text-sm font-bold text-slate-100">{item.title}</h3>
                          </div>
                          <span className="font-mono text-[10px] text-[#888888]">{item.agent}</span>
                        </div>
                        <p className="text-xs text-[#888888] leading-relaxed">{item.desc}</p>
                        <div className="flex justify-between items-center border-t border-dashed border-[#141416] pt-2.5 mt-1 text-[10px] font-mono">
                          <span className="text-[#444444]">{item.meta}</span>
                          <button
                            disabled={item.executed}
                            onClick={(e) => { e.stopPropagation(); handleExecuteAction(item.id); }}
                            className={`font-mono text-[10px] px-3 py-1.5 border rounded cursor-pointer transition-all ${
                              item.executed
                                ? 'bg-white text-black border-white cursor-not-allowed'
                                : 'bg-[#0c0c0e] border-[#141416] text-white hover:bg-white hover:text-black hover:border-white'
                            }`}
                          >
                            {item.executed ? 'EXECUTED' : 'Execute Action'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* ==================== Missing Information Card ==================== */}
          <div
            id="card-action-missing-info"
            className={`card ${getCardPositionClass('card-action-missing-info')}`}
            onClick={(e) => handleCardClick('card-action-missing-info', e)}
          >
            <div className="card-preview">
              <div className="preview-header flex items-center justify-between gap-3">
                <div className="preview-title-group min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-[#888888]">ACTIONS // GAP</span>
                  <h3 className="truncate">Missing Info</h3>
                </div>
                <span className="shrink-0 font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-white text-black whitespace-nowrap">78%</span>
              </div>
              <div className="preview-body">
                <p className="preview-log-text">Requires input to complete setup</p>
              </div>
            </div>

            <div className="card-main">
              <div className="main-header">
                <div className="main-title-group">
                  <h2>Missing Information</h2>
                  <p>AI detected information required to complete your startup.</p>
                </div>
              </div>
              <div className="main-body flex-grow overflow-y-auto flex flex-col gap-4">
                {/* Progress bar */}
                <div className="bg-[#08080b] border border-[#141416] p-3 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-200">Startup Completeness</span>
                    <span className="font-mono font-bold text-slate-100">78% Complete</span>
                  </div>
                  <div className="w-full bg-[#111115] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-white h-full rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>

                {/* Items list */}
                <div className="flex flex-col gap-2">
                  {[
                    { title: 'Customer Persona', priority: 'high', desc: 'Identify core developers and team leads templates.', icon: User },
                    { title: 'Pricing Strategy', priority: 'high', desc: 'Detailed pricing tier structures and user seat configs.', icon: CreditCard },
                    { title: 'Go-To-Market Plan', priority: 'medium', desc: 'Acquisition pathways and viral growth loop spec.', icon: Target },
                    { title: 'Brand Guidelines', priority: 'low', desc: 'Visual identity system, font stacks, and colors.', icon: Palette },
                    { title: 'Tech Stack Details', priority: 'medium', desc: 'Database schema design and server deployment configurations.', icon: Wrench },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-[#08080b] border border-[#141416] p-3 rounded-lg flex items-start gap-3 hover:border-neutral-500 transition-all">
                      <div className="p-2 bg-white/5 rounded-lg border border-[#141416] shrink-0 text-slate-300">
                        <item.icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-xs text-slate-100 truncate">{item.title}</h4>
                          <span className={`font-mono text-[8px] font-bold px-1.5 py-0.5 rounded ${
                            item.priority === 'high' ? 'bg-red-950 text-red-400 border border-red-900/50' :
                            item.priority === 'medium' ? 'bg-amber-950 text-amber-400 border border-amber-900/50' :
                            'bg-emerald-950 text-emerald-400 border border-emerald-900/50'
                          }`}>
                            {item.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#888888] mt-1 leading-normal">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer link */}
                <div className="mt-auto pt-2 border-t border-[#141416] flex justify-end">
                  <span 
                    onClick={() => logSystemMessage('Redirecting to Workspace Core Modules checklist...')}
                    className="font-mono text-[10px] text-white/70 hover:text-white cursor-pointer select-none"
                  >
                    View All Missing Items →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== Today's Tasks Card ==================== */}
          <div
            id="card-action-todays-tasks"
            className={`card ${getCardPositionClass('card-action-todays-tasks')}`}
            onClick={(e) => handleCardClick('card-action-todays-tasks', e)}
          >
            <div className="card-preview">
              <div className="preview-header flex items-center justify-between gap-3">
                <div className="preview-title-group min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-[#888888]">ACTIONS // TODO</span>
                  <h3 className="truncate">Today's Tasks</h3>
                </div>
                <span className="shrink-0 font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-white text-black whitespace-nowrap">
                  {todaysTasks.filter(t => !t.completed).length} LEFT
                </span>
              </div>
              <div className="preview-body">
                <p className="preview-log-text">Latest: {todaysTasks.find(t => !t.completed)?.title || 'All done!'}</p>
              </div>
            </div>

            <div className="card-main">
              <div className="main-header flex items-center justify-between">
                <div className="main-title-group font-mono">
                  <h2>Today's Tasks</h2>
                  <p>Your prioritized tasks</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsAddingTask(true); }}
                    className="font-mono text-[9px] font-bold px-2.5 py-1 bg-white/5 border border-[#141416] text-[#888888] hover:text-white hover:border-white transition-all rounded-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={10} strokeWidth={2.5} />
                    Add Task
                  </button>
                  <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-mono text-xs font-bold">
                    {todaysTasks.filter(t => !t.completed).length}
                  </div>
                </div>
              </div>
              <div className="main-body flex-grow overflow-hidden flex flex-col gap-3.5">
                {isAddingTask ? (
                  <div className="flex flex-col gap-3 p-3 bg-[#08080b]/60 border border-[#141416] rounded-xl font-mono text-xs select-none">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-[#666] uppercase">Task Title</span>
                      <input
                        type="text"
                        value={taskFormTitle}
                        onChange={(e) => setTaskFormTitle(e.target.value)}
                        placeholder="e.g. Ingest strategies"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-black/50 border border-[#141416] rounded-lg p-2 text-white focus:outline-none focus:border-white/50 text-[11px] font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-[#666] uppercase">Priority</span>
                        <select
                          value={taskFormPriority}
                          onChange={(e) => setTaskFormPriority(e.target.value as any)}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-black/50 border border-[#141416] rounded-lg p-2 text-white focus:outline-none focus:border-white/50 text-[11px] font-mono cursor-pointer"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-[#666] uppercase">Due Date</span>
                        <input
                          type="text"
                          value={taskFormDueDate}
                          onChange={(e) => setTaskFormDueDate(e.target.value)}
                          placeholder="e.g. Today"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-black/50 border border-[#141416] rounded-lg p-2 text-white focus:outline-none focus:border-white/50 text-[11px] font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!taskFormTitle.trim()) return;
                          handleAddNewTask(taskFormTitle, taskFormPriority, taskFormDueDate);
                          setTaskFormTitle('');
                          setTaskFormPriority('medium');
                          setTaskFormDueDate('Today');
                          setIsAddingTask(false);
                        }}
                        className="flex-1 font-mono text-[10px] py-2 bg-white text-black rounded hover:bg-neutral-200 transition-all font-bold cursor-pointer text-center border-0"
                      >
                        Save Task
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAddingTask(false);
                        }}
                        className="flex-1 font-mono text-[10px] py-2 border border-[#141416] bg-[#0c0c0e] hover:bg-white hover:text-black hover:border-white text-white transition-all rounded cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Progress Section */}
                    {(() => {
                      const completedCount = todaysTasks.filter(t => t.completed).length;
                      const totalCount = todaysTasks.length;
                      const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                      return (
                        <div className="flex flex-col gap-1.5 px-1">
                          <div className="flex justify-between items-center text-[10px] font-mono text-[#888888]">
                            <span>{completedCount} / {totalCount} Tasks Completed</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="w-full bg-[#111115] h-1.5 rounded-full overflow-hidden">
                            <motion.div 
                              className="bg-white h-full rounded-full" 
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.3, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {/* Task list container */}
                    <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-2.5 mt-2">
                      <AnimatePresence initial={false}>
                        {[...todaysTasks]
                          .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1))
                          .map((task) => (
                            <motion.div
                              layout
                              key={task.id}
                              className={`bg-[#08080b] border border-[#141416] p-3 rounded-lg flex items-center justify-between gap-3 transition-colors duration-150 hover:bg-[#111116] group cursor-pointer ${
                                task.completed ? 'opacity-50' : ''
                              }`}
                              onClick={() => toggleTodayTask(task.id)}
                            >
                              <div className="flex items-center gap-3">
                                {/* Checkbox */}
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                  task.completed 
                                    ? 'bg-white border-white text-black' 
                                    : 'border-[#2a2a2a] group-hover:border-neutral-500'
                                }`}>
                                  {task.completed && <Check size={10} strokeWidth={3} />}
                                </div>
                                <div className="flex flex-col">
                                  <span className={`text-xs text-slate-200 transition-all font-mono ${
                                    task.completed ? 'line-through text-slate-500' : ''
                                  }`}>
                                    {task.title}
                                  </span>
                                  {task.dueDate && (
                                    <span className="text-[9px] text-[#666] mt-0.5 font-mono">
                                      {task.dueDate}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1.5 shrink-0 ${
                                task.priority === 'high' ? 'bg-red-950/40 text-red-400 border border-red-900/40' :
                                task.priority === 'medium' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40' :
                                'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  task.priority === 'high' ? 'bg-red-500 animate-pulse' :
                                  task.priority === 'medium' ? 'bg-amber-500' :
                                  'bg-emerald-500'
                                }`} />
                                {task.priority.toUpperCase()}
                              </span>
                            </motion.div>
                          ))}
                      </AnimatePresence>
                    </div>

                    {/* Removed View All Tasks footer */}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ==================== Recent Notes Card ==================== */}
          <div
            id="card-action-recent-notes"
            className={`card ${getCardPositionClass('card-action-recent-notes')}`}
            onClick={(e) => handleCardClick('card-action-recent-notes', e)}
          >
            <div className="card-preview">
              <div className="preview-header flex items-center justify-between gap-3">
                <div className="preview-title-group min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-[#888888]">ACTIONS // NOTES</span>
                  <h3 className="truncate">Recent Notes</h3>
                </div>
                <span className="shrink-0 font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-white text-black whitespace-nowrap">
                  {notes.length} ENTRIES
                </span>
              </div>
              <div className="preview-body">
                <p className="preview-log-text">Latest: {notes[0]?.title}</p>
              </div>
            </div>

            <div className="card-main">
              <div className="main-header flex items-center justify-between">
                <div className="main-title-group">
                  <h2>Recent Notes</h2>
                  <p>Important startup knowledge</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsAddingNote(true); }}
                  className="font-mono text-[10px] px-2.5 py-1 bg-white text-black rounded hover:bg-neutral-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={10} strokeWidth={2.5} />
                  New Note
                </button>
              </div>
              <div className="main-body flex-grow overflow-y-auto flex flex-col gap-3">
                {isAddingNote ? (
                  <div className="flex flex-col gap-3 p-3 bg-[#08080b]/60 border border-[#141416] rounded-xl font-mono text-xs select-none">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-[#666] uppercase">Note Title</span>
                      <input
                        type="text"
                        value={noteFormTitle}
                        onChange={(e) => setNoteFormTitle(e.target.value)}
                        placeholder="e.g. GTM campaigns"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-black/50 border border-[#141416] rounded-lg p-2 text-white focus:outline-none focus:border-white/50 text-[11px] font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-[#666] uppercase">Category</span>
                      <input
                        type="text"
                        value={noteFormCategory}
                        onChange={(e) => setNoteFormCategory(e.target.value)}
                        placeholder="e.g. Marketing"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-black/50 border border-[#141416] rounded-lg p-2 text-white focus:outline-none focus:border-white/50 text-[11px] font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-[#666] uppercase">Content / Summary</span>
                      <textarea
                        value={noteFormContent}
                        onChange={(e) => setNoteFormContent(e.target.value)}
                        placeholder="Type note details..."
                        rows={3}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-black/50 border border-[#141416] rounded-lg p-2 text-white focus:outline-none focus:border-white/50 text-[11px] font-mono resize-none no-scrollbar"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!noteFormTitle.trim()) return;
                          handleAddNewNote(noteFormTitle, noteFormCategory, noteFormContent);
                          setNoteFormTitle('');
                          setNoteFormCategory('General');
                          setNoteFormContent('');
                          setIsAddingNote(false);
                        }}
                        className="flex-1 font-mono text-[10px] py-2 bg-white text-black rounded hover:bg-neutral-200 transition-all font-bold cursor-pointer text-center border-0"
                      >
                        Save Note
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAddingNote(false);
                        }}
                        className="flex-1 font-mono text-[10px] py-2 border border-[#141416] bg-[#0c0c0e] hover:bg-white hover:text-black hover:border-white text-white transition-all rounded cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2 max-h-[300px]">
                      {notes.slice(0, 5).map((note) => (
                        <div key={note.id} className="bg-[#08080b] border border-[#141416] p-3 rounded-lg flex flex-col gap-1.5 hover:border-neutral-500 transition-all relative">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {note.pinned && <Pin size={10} className="text-[#888888] rotate-45 shrink-0" />}
                              <h4 className="font-bold text-xs text-slate-100 truncate">{note.title}</h4>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="font-mono text-[8px] border border-[#141416] px-1.5 py-0.5 rounded text-[#888888]">{note.category}</span>
                              <span className="font-mono text-[8px] text-[#666]">{note.updatedAt}</span>
                            </div>
                          </div>
                          {note.summary && (
                            <p className="text-[10px] text-[#888888] line-clamp-1 italic">
                              AI: {note.summary}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Removed View All Notes footer */}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ==================== 22. Automated Workflow Triggers ==================== */}
          <div
            id="card-action-triggers"
            className={`card ${getCardPositionClass('card-action-triggers')}`}
            onClick={(e) => handleCardClick('card-action-triggers', e)}
          >
            <div className="card-preview">
              <div className="preview-header flex items-center justify-between gap-3">
                <div className="preview-title-group min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-[#888888]">ACTIONS // TRIGGERS</span>
                  <h3 className="truncate">Auto Triggers</h3>
                </div>
                <span className="shrink-0 font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-white text-black whitespace-nowrap">
                  3 ACTIVE
                </span>
              </div>
              <div className="preview-body">
                <p className="preview-log-text">Doc Ingestion Sync: ON</p>
              </div>
            </div>

            <div className="card-main">
              <div className="main-header">
                <div className="main-title-group">
                  <h2>Automated Agent Workflow Triggers</h2>
                  <p>Configure automated system reaction rules for onecrew agent events.</p>
                </div>
              </div>
              <div className="main-body flex-grow overflow-y-auto">
                <WorkflowTriggersList
                  triggers={[
                    { id: 'trig-01', name: ' Trigger 01: Document Ingestion Sync', condition: 'New file uploaded to Document Tracker', routine: 'Auto-parse chunks, embed vectors & notify Context Agent', enabled: true },
                    { id: 'trig-02', name: ' Trigger 02: High Latency Auto-Balance', condition: 'Latency metrics exceed 45ms for >5s', routine: 'Re-route edge sockets through secondary cluster', enabled: true },
                    { id: 'trig-03', name: ' Trigger 03: Security Token Expiry Alert', condition: 'Token age reaches 12 hours', routine: 'Flag high-priority action item in Action Center', enabled: true },
                    { id: 'trig-04', name: ' Trigger 04: MVP Step Auto-Advance', condition: 'Step confidence reaches 90%+', routine: 'Auto-trigger compilation without manual approval', enabled: false },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* ==================== 23. Priority & Effort Matrix ==================== */}
          <div
            id="card-action-priority"
            className={`card ${getCardPositionClass('card-action-priority')}`}
            onClick={(e) => handleCardClick('card-action-priority', e)}
          >
            <div className="card-preview">
              <div className="preview-header flex items-center justify-between gap-3">
                <div className="preview-title-group min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-[#888888]">ACTIONS // MATRIX</span>
                  <h3 className="truncate">Priority Matrix</h3>
                </div>
                <span className="shrink-0 font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-white text-black uppercase whitespace-nowrap">
                  Balanced
                </span>
              </div>
              <div className="preview-body">
                <p className="preview-log-text">2 High Impact / Low Effort</p>
              </div>
            </div>

            <div className="card-main">
              <div className="main-header">
                <div className="main-title-group">
                  <h2>Action Priority & Effort Matrix</h2>
                  <p>Strategic breakdown of startup tasks by impact vs implementation complexity.</p>
                </div>
              </div>
              <div className="main-body flex-grow overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#08080b] border border-white/20 p-4 rounded-lg flex flex-col gap-2">
                    <h3 className="font-mono text-xs text-slate-100 font-bold flex items-center gap-2">
                      <Flame size={18} strokeWidth={1.8} className="text-white shrink-0" />
                      <span>High Impact / Low Effort (Quick Wins)</span>
                    </h3>
                    <div className="text-xs text-[#888888] flex flex-col gap-1 leading-relaxed">
                      <div>• Compile Step 4 Sync Build Target</div>
                      <div>• Rotate Master Security Token</div>
                      <div>• Run System Latency Protocol</div>
                    </div>
                  </div>

                  <div className="bg-[#08080b] border border-[#141416] p-4 rounded-lg flex flex-col gap-2">
                    <h3 className="font-mono text-xs text-slate-100 font-bold flex items-center gap-2">
                      <Rocket size={18} strokeWidth={1.8} className="text-white shrink-0" />
                      <span>High Impact / High Effort (Strategic Projects)</span>
                    </h3>
                    <div className="text-xs text-[#888888] flex flex-col gap-1 leading-relaxed">
                      <div>• Full RAG Vector Memory Fine-tuning</div>
                      <div>• Multi-Agent Parallel Autonomous Workflows</div>
                      <div>• Custom Domain Security SSL Infrastructure</div>
                    </div>
                  </div>

                  <div className="bg-[#08080b] border border-[#141416] p-4 rounded-lg flex flex-col gap-2">
                    <h3 className="font-mono text-xs text-slate-100 font-bold flex items-center gap-2">
                      <BrushCleaning size={18} strokeWidth={1.8} className="text-white shrink-0" />
                      <span>Low Impact / Low Effort (Fill-in Tasks)</span>
                    </h3>
                    <div className="text-xs text-[#888888] flex flex-col gap-1 leading-relaxed">
                      <div>• Clear Ingestion Log History</div>
                      <div>• Refresh Telemetry Canvas Graphs</div>
                    </div>
                  </div>

                  <div className="bg-[#08080b] border border-[#141416] p-4 rounded-lg flex flex-col gap-2">
                    <h3 className="font-mono text-xs text-slate-100 font-bold flex items-center gap-2">
                      <Hourglass size={18} strokeWidth={1.8} className="text-white shrink-0" />
                      <span>Low Impact / High Effort (De-prioritized)</span>
                    </h3>
                    <div className="text-xs text-[#888888] flex flex-col gap-1 leading-relaxed">
                      <div>• Legacy API Backward Compatibility Layer</div>
                      <div>• Manual Database Table Schema Export</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== 28. Startup Roadmap ==================== */}
          <div
            id="card-startup-roadmap"
            className={`card ${getCardPositionClass('card-startup-roadmap')}`}
            onClick={(e) => handleCardClick('card-startup-roadmap', e)}
          >
            <div className="card-preview">
              <div className="preview-header flex items-center justify-between gap-3">
                <div className="preview-title-group min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-[#888888]">ROADMAP</span>
                  <h3 className="truncate">Startup Roadmap</h3>
                </div>
                <span className="shrink-0 font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-white text-black whitespace-nowrap">
                  50% COMPLETED
                </span>
              </div>
              <div className="preview-body">
                <p className="preview-log-text">Current: Build MVP</p>
              </div>
            </div>

            <div className="card-main">
              <div className="main-header">
                <div className="main-title-group">
                  <h2>Startup Operating Roadmap</h2>
                  <p>Comprehensive vertical timeline charting the growth lifecycle from Idea to Scale.</p>
                </div>
              </div>
              <div className="main-body flex-grow overflow-y-auto flex flex-col gap-4">
                <div className="bg-[#08080b] border border-[#141416] p-4 rounded-lg flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[#888888]">OVERALL ROADMAP PROGRESS</span>
                    <span className="text-slate-100 font-bold">50%</span>
                  </div>
                  <div className="w-full bg-[#111115] h-2 rounded-full overflow-hidden">
                    <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: '50%' }}></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#666] pt-1">
                    <span>LAUNCH TARGET: OCT 15, 2026</span>
                    <span>3 / 6 STAGES REACHED</span>
                  </div>
                </div>

                <div className="relative pl-6 flex flex-col gap-5 border-l border-white/5 my-2 ml-3">
                  {[
                    { step: '01', title: 'Idea Validation', desc: 'Confirm problem-solution fit via qualitative interviews and landing page test metrics.', status: 'COMPLETED' },
                    { step: '02', title: 'Business Model Definition', desc: 'Outline pricing plans, SaaS subscription structure, unit economics target projections.', status: 'COMPLETED' },
                    { step: '03', title: 'Build MVP Architecture', desc: 'Deploy Next.js console, connect agent workflows, index documentation repository logs.', status: 'ACTIVE' },
                    { step: '04', title: 'Beta User Testing', desc: 'Roll out MVP build to 50 curated testers. Collect error rates, CSAT metrics, and feedback loops.', status: 'QUEUED' },
                    { step: '05', title: 'Public Onboarding Launch', desc: 'Open public registration gateways. Target token-metered workspace growth limits.', status: 'QUEUED' },
                    { step: '06', title: 'Scale & Fine-Tuning', desc: 'Optimize query latency, fine-tune context models on persistent customer support metrics.', status: 'QUEUED' },
                  ].map((stage, idx) => {
                    const isCompleted = stage.status === 'COMPLETED';
                    const isActive = stage.status === 'ACTIVE';
                    return (
                      <div key={idx} className="relative group">
                        <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-300 ${
                          isCompleted ? 'bg-white border-white text-black text-[9px] font-bold shadow-[0_0_8px_rgba(255,255,255,0.4)]' :
                          isActive ? 'bg-black border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.4)] timeline-active-node' :
                          'bg-[#08080b] border-[#141416] text-[#666]'
                        }`}>
                          {isCompleted ? <span className="checkmark-pop">✓</span> : ''}
                          {isActive ? '•' : ''}
                        </div>
                        
                        <div className={`flex flex-col gap-1 transition-all ${isActive ? 'opacity-100' : 'opacity-65 group-hover:opacity-90'}`}>
                          <div className="flex justify-between items-center">
                            <h3 className={`font-mono text-xs font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                              STAGE {stage.step}: {stage.title}
                            </h3>
                            <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isCompleted ? 'bg-white/10 text-slate-100 border border-white/5' :
                              isActive ? 'bg-white/10 text-white border border-white/20 animate-pulse' :
                              'bg-transparent text-[#666] border border-[#141416]'
                            }`}>
                              {stage.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#888888] leading-relaxed">{stage.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); logSystemMessage("Roadmap synchronization requested."); }}
                    className="font-mono text-[10px] px-3.5 py-2 border border-[#141416] bg-[#0c0c0e] hover:bg-white hover:text-black hover:border-white transition-all rounded cursor-pointer"
                  >
                    Export Roadmap Spec
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== 29. Milestone Tracker ==================== */}
          <div
            id="card-milestone-tracker"
            className={`card ${getCardPositionClass('card-milestone-tracker')}`}
            onClick={(e) => handleCardClick('card-milestone-tracker', e)}
          >
            <div className="card-preview">
              <div className="preview-header flex items-center justify-between gap-3">
                <div className="preview-title-group min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-[#888888]">ACTIVE MILESTONE</span>
                  <h3 className="truncate">Build MVP</h3>
                </div>
                <span className="shrink-0 font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-white text-black whitespace-nowrap">
                  {milestoneProgress}%
                </span>
              </div>
              <div className="preview-body">
                <p className="preview-log-text">{completedTasksCount} / {totalTasksCount} Tasks Completed</p>
              </div>
            </div>

            <div className="card-main">
              <div className="main-header">
                <div className="main-title-group">
                  <h2>Active Milestone Tracker</h2>
                  <p>Check off target tasks inside the current workspace build block to update progress indicators.</p>
                </div>
              </div>
              
              <div className="main-body flex-grow overflow-y-auto flex flex-col lg:flex-row gap-5">
                {/* Left Progress Wheel Panel */}
                <div className="flex flex-col items-center justify-center bg-[#08080b] border border-[#141416] p-5 rounded-lg w-full lg:w-[180px] shrink-0 gap-2">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      {/* Background circle */}
                      <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        className="stroke-[#111115] fill-none"
                        strokeWidth={strokeWidth}
                      />
                      {/* Progress circle */}
                      <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        className="stroke-white fill-none transition-all duration-500 ease-out"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                      <span className="text-lg font-bold text-slate-100">{milestoneProgress}%</span>
                      <span className="text-[8px] text-[#888888] uppercase tracking-widest">completed</span>
                    </div>
                  </div>
                  <span className="font-mono text-[9px] font-bold text-slate-400 mt-2 text-center">
                    MILESTONE: BUILD MVP
                  </span>
                </div>

                {/* Center Checklist Panel */}
                <div className="flex-grow flex flex-col gap-3 min-w-0">
                  <h3 className="font-mono text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-0.5">
                    Milestone Tasks Checklist
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {milestoneTasks.map((t) => (
                      <div 
                        key={t.id}
                        onClick={(e) => { e.stopPropagation(); toggleMilestoneTask(t.id); }}
                        className={`flex items-start gap-3 bg-[#08080b] border p-3 rounded-lg cursor-pointer transition-all ${
                          t.completed ? 'border-white/10 opacity-70 hover:opacity-85' : 'border-[#141416] hover:border-neutral-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={t.completed}
                          onChange={() => {}} // toggling is handled by outer div click for wider touch area
                          className="mt-0.5 cursor-pointer accent-white h-3.5 w-3.5 shrink-0"
                        />
                        <div className="flex-grow min-w-0 leading-normal">
                          <div className={`text-xs font-medium truncate ${t.completed ? 'line-through text-[#666]' : 'text-slate-100'}`}>
                            {t.title}
                          </div>
                          <div className="text-[9px] font-mono text-[#888888] mt-0.5">DUE: {t.dueDate}</div>
                        </div>
                        <span className={`font-mono text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          t.completed ? 'bg-white text-black' : 'border border-dashed border-[#888888] text-slate-100'
                        }`}>
                          {t.completed ? 'DONE' : 'PENDING'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Details Panel */}
                <div className="w-full lg:w-[200px] bg-[#08080b] border border-[#141416] p-4 rounded-lg flex flex-col gap-3 justify-between shrink-0 font-mono text-[11px]">
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-[10px] font-bold text-slate-100 uppercase border-b border-[#141416] pb-2">
                      Milestone Details
                    </h3>
                    <div className="flex justify-between items-center text-[#888888]">
                      <span>Start Date:</span>
                      <span className="text-slate-200">Jul 10, 2026</span>
                    </div>
                    <div className="flex justify-between items-center text-[#888888]">
                      <span>Target Date:</span>
                      <span className="text-slate-200">Aug 20, 2026</span>
                    </div>
                    <div className="flex justify-between items-center text-[#888888]">
                      <span>Tasks Done:</span>
                      <span className="text-slate-200">{completedTasksCount} / {totalTasksCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-[#888888]">
                      <span>Remaining:</span>
                      <span className="text-slate-200">{totalTasksCount - completedTasksCount}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-dashed border-white/5">
                    <div className="flex justify-between items-center mb-1.5 text-[9px] text-[#888888]">
                      <span>ACTIVE TARGET PROGRESS</span>
                      <span className="text-slate-100">{milestoneProgress}%</span>
                    </div>
                    <div className="w-full bg-[#111115] h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-white h-full rounded-full transition-all duration-500" 
                        style={{ width: `${milestoneProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ==================== 30. Startup Progress ==================== */}
          <div
            id="card-startup-progress"
            className={`card ${getCardPositionClass('card-startup-progress')}`}
            onClick={(e) => handleCardClick('card-startup-progress', e)}
          >
            <div className="card-preview">
              <div className="preview-header flex items-center justify-between gap-3">
                <div className="preview-title-group min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-[#888888]">GROWTH MATRIX</span>
                  <h3 className="truncate">Startup Progress</h3>
                </div>
                <span className="shrink-0 font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-white text-black whitespace-nowrap">
                  {calculatedGrowthProgress}% GROWTH
                </span>
              </div>
              <div className="preview-body">
                <p className="preview-log-text">Foundation check: 95% complete</p>
              </div>
            </div>

            <div className="card-main">
              <div className="main-header">
                <div className="main-title-group">
                  <h2>Executive Startup Growth Progress</h2>
                  <p>Overall operational readiness index and section parameters tracking.</p>
                </div>
              </div>
              
              <div className="main-body flex-grow overflow-y-auto flex flex-col gap-4">
                {/* SVG Progress chart panel */}
                <div className="bg-[#08080b] border border-[#141416] p-4 rounded-lg flex flex-col md:flex-row gap-5 items-center">
                  <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-[140px] border-b md:border-b-0 md:border-r border-[#141416] pb-4 md:pb-0 md:pr-4 gap-1">
                    <span className="font-mono text-[10px] text-[#888888] uppercase tracking-wider">Overall Growth</span>
                    <span className="font-mono text-3xl font-bold text-slate-100">{calculatedGrowthProgress}%</span>
                    <span className="font-mono text-[9px] text-white font-medium uppercase tracking-widest mt-1">NOMINAL EXPANSION</span>
                  </div>
                  
                  {/* SVG Chart */}
                  <div className="flex-grow h-[120px] w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 440 120">
                      {/* Grid Lines */}
                      <line x1="20" y1="20" x2="420" y2="20" stroke="rgba(255,255,255,0.02)" />
                      <line x1="20" y1="50" x2="420" y2="50" stroke="rgba(255,255,255,0.02)" />
                      <line x1="20" y1="80" x2="420" y2="80" stroke="rgba(255,255,255,0.02)" />
                      <line x1="20" y1="110" x2="420" y2="110" stroke="rgba(255,255,255,0.05)" />
                      
                      {/* Area Fill */}
                      <path
                        d={areaD}
                        className="fill-white/5 transition-all duration-500"
                      />
                      {/* Chart Path Line */}
                      <path
                        d={pathD}
                        className="stroke-white fill-none transition-all duration-500"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      
                      {/* Nodes */}
                      {points.map((pt, idx) => (
                        <g key={idx} className="group/node">
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="4"
                            className="fill-[#08080b] stroke-white stroke-[2] transition-all duration-500"
                          />
                          <text
                            x={pt.x}
                            y="118"
                            className="fill-[#666] font-mono text-[8px]"
                            textAnchor="middle"
                          >
                            {pt.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Module Progress Grid */}
                <div className="flex flex-col gap-2.5">
                  <h3 className="font-mono text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-0.5">
                    Operating Module Breakdown
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { name: 'Foundation', progress: 95, status: 'STABLE' },
                      { name: 'Business Model', progress: 80, status: 'STABLE' },
                      { name: 'Product MVP', progress: calculatedGrowthProgress, status: 'IN_PROGRESS' },
                      { name: 'Marketing Specs', progress: 45, status: 'QUEUED' },
                      { name: 'Sales Strategy', progress: 30, status: 'QUEUED' },
                      { name: 'Milestone Execution', progress: milestoneProgress, status: 'ACTIVE' },
                      { name: 'Resources Vault', progress: 70, status: 'STABLE' },
                      { name: 'Legal/Compliance', progress: 85, status: 'STABLE' },
                    ].map((mod, idx) => (
                      <div key={idx} className="bg-[#08080b] border border-[#141416] p-3 rounded-lg flex flex-col gap-2">
                        <div className="flex justify-between items-center font-mono text-[10px]">
                          <span className="font-bold text-slate-100 truncate pr-2">{mod.name}</span>
                          <span className="text-[#888888]">{mod.progress}%</span>
                        </div>
                        <div className="w-full bg-[#111115] h-1 rounded-full overflow-hidden">
                          <div 
                            className="bg-white h-full rounded-full transition-all duration-500" 
                            style={{ width: `${mod.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-[8px] font-mono mt-0.5 text-[#444]">
                          <span>SYS_TAG_{mod.name.substring(0, 3).toUpperCase()}</span>
                          <span className={`font-bold ${mod.status === 'STABLE' ? 'text-slate-400' : mod.status === 'ACTIVE' || mod.status === 'IN_PROGRESS' ? 'text-white' : 'text-neutral-600'}`}>{mod.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ==================== 31. Launch Readiness ==================== */}
          <div
            id="card-launch-readiness"
            className={`card ${getCardPositionClass('card-launch-readiness')}`}
            onClick={(e) => handleCardClick('card-launch-readiness', e)}
          >
            <div className="card-preview">
              <div className="preview-header flex items-center justify-between gap-3">
                <div className="preview-title-group min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-[#888888]">LAUNCH CONFIDENCE</span>
                  <h3 className="truncate">Launch Readiness</h3>
                </div>
                <span className="shrink-0 font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-white text-black whitespace-nowrap">
                  {launchReadinessScore}%
                </span>
              </div>
              <div className="preview-body">
                <p className="preview-log-text">AI Status: Good Progress</p>
              </div>
            </div>

            <div className="card-main">
              <div className="main-header">
                <div className="main-title-group">
                  <h2>AI Launch Readiness Audit</h2>
                  <p>Weighted confidence indexing generated by structural compliance models.</p>
                </div>
              </div>
              
              <div className="main-body flex-grow overflow-y-auto flex flex-col gap-4">
                {/* Circular readiness score & recommendation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Circular Gauge */}
                  <div className="bg-[#08080b] border border-[#141416] p-4 rounded-lg flex flex-col items-center justify-center gap-2">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          className="stroke-[#111115] fill-none"
                          strokeWidth="6"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          className="stroke-white fill-none transition-all duration-500 ease-out"
                          strokeWidth="6"
                          strokeDasharray={2 * Math.PI * 32}
                          strokeDashoffset={2 * Math.PI * 32 - (launchReadinessScore / 100) * 2 * Math.PI * 32}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                        <span className="text-base font-bold text-slate-100">{launchReadinessScore}%</span>
                        <span className="text-[7px] text-[#888888] uppercase">ready</span>
                      </div>
                    </div>
                    <span className="font-mono text-[9px] text-white font-bold animate-pulse">
                      STATUS: GOOD PROGRESS
                    </span>
                  </div>

                  {/* Recommendation Panel */}
                  <div className="bg-[#08080b] border border-[#141416] p-4 rounded-lg flex flex-col gap-2.5 md:col-span-2 justify-between">
                    <div className="flex flex-col gap-1">
                      <h4 className="font-mono text-[10px] text-slate-100 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={13} className="text-white" />
                        AI Strategic Recommendation
                      </h4>
                      <p className="text-xs text-[#888888] leading-relaxed">
                        "Your Launch Readiness Index is currently at {launchReadinessScore}%. Product MVP builds are active, but marketing readiness is lagging behind at 55%. Complete beta registration setups to refine public user acquisition funnels before Q4 launch."
                      </p>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); logSystemMessage("Compliance audit logs requested."); }}
                        className="font-mono text-[9px] px-3 py-1.5 border border-[#141416] bg-[#0c0c0e] hover:bg-white hover:text-black hover:border-white transition-all rounded cursor-pointer"
                      >
                        View System Audit Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Categories progress bars */}
                <div className="flex flex-col gap-2.5">
                  <h3 className="font-mono text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-0.5">
                    Readiness Categories Scorecard
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      { name: 'Launch Readiness Indicator', pct: launchReadinessScore },
                      { name: 'Investor/Funding Readiness', pct: 60 },
                      { name: 'Product/MVP Codebase Stability', pct: calculatedGrowthProgress },
                      { name: 'Business Model Integrity', pct: 70 },
                      { name: 'Marketing & Acquisition Prep', pct: 55 },
                      { name: 'Operational & Infra Readiness', pct: 85 },
                    ].map((cat, idx) => (
                      <div key={idx} className="bg-[#08080b] border border-[#141416] p-3 rounded-lg flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-slate-200">{cat.name}</span>
                          <span className="font-mono font-bold text-slate-100">{cat.pct}%</span>
                        </div>
                        <div className="w-full bg-[#111115] h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-white h-full rounded-full transition-all duration-500" 
                            style={{ width: `${cat.pct}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ==================== 31. Workspace Graph Side Card ==================== */}
          <div
            id="card-workspace-graph-side"
            className={`card ${getCardPositionClass('card-workspace-graph-side')}`}
          >
            <div className="card-preview">
              <div className="preview-header flex items-center justify-between gap-3">
                <div className="preview-title-group min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-[#888888]">ACTION // GRAPH</span>
                  <h3 className="truncate">Workspace Graph</h3>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 font-mono text-[9px] font-bold bg-white text-black px-2 py-0.5 rounded whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  17 NODES
                </div>
              </div>
              
              <div className="preview-body">
                <p className="preview-log-text">Dependency mapping active</p>
              </div>
            </div>
          </div>

          {/* ==================== 32. Workspace Graph ==================== */}
          <div
            id="card-workspace-graph"
            className={`card ${getCardPositionClass('card-workspace-graph')} ${
              isGraphFullscreen ? '!z-[99999] !fixed !inset-0 !w-screen !h-screen !m-0 !rounded-none !border-none graph-fullscreen-active' : ''
            }`}
            onClick={(e) => handleCardClick('card-workspace-graph', e)}
          >
            <div className="card-preview">
              <div className="preview-header flex items-center justify-between gap-3">
                <div className="preview-title-group min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-[#888888]">ACTION // GRAPH</span>
                  <h3 className="truncate">Workspace Graph</h3>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 font-mono text-[9px] font-bold bg-white text-black px-2 py-0.5 rounded whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  17 NODES
                </div>
              </div>
              
              <div className="preview-body">
                <p className="preview-log-text">Dependency mapping active</p>
              </div>
            </div>

            <div className="card-main">
              <div className="main-header">
                <div className="main-title-group flex-1 min-w-0">
                  <h2>Workspace Graph</h2>
                  <p>Visual directory of dependencies, blocks, and hierarchy networks linking all operational elements.</p>
                </div>
              </div>

              <div className={`main-body flex-grow flex flex-col ${isSidebarOpen ? 'overflow-y-auto' : 'md:flex-row overflow-hidden'} gap-4 relative min-h-0`}>
                {/* Graph Main Interactive Container */}
                <div className={`flex flex-col min-w-0 bg-[#08080b] border border-[#141416] rounded-xl overflow-hidden relative ${isSidebarOpen ? 'h-[350px] shrink-0' : 'flex-grow min-h-0'}`}>
                  
                  {/* Top Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-6 bg-black/40 border-b border-[#141416] z-10 font-mono text-xs select-none">
                    
                    {/* View Toggle */}
                    <div className="flex bg-[#0c0c0e] border border-[#141416] p-0.5 rounded-lg h-8 items-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveGraphView('graph'); }}
                        className={`px-3 h-full flex items-center justify-center rounded-md font-bold transition-all cursor-pointer ${
                          activeGraphView === 'graph' ? 'bg-white text-black' : 'text-[#888888] hover:text-white'
                        }`}
                      >
                        Graph View
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveGraphView('list'); }}
                        className={`px-3 h-full flex items-center justify-center rounded-md font-bold transition-all cursor-pointer ${
                          activeGraphView === 'list' ? 'bg-white text-black' : 'text-[#888888] hover:text-white'
                        }`}
                      >
                        List View
                      </button>
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 max-w-[200px]">
                      <input
                        type="text"
                        placeholder="Search node..."
                        value={graphSearchQuery}
                        onChange={(e) => setGraphSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-[#0c0c0e] border border-[#141416] rounded-lg px-2.5 h-8 text-xs text-white placeholder-[#555] focus:outline-none focus:border-white/50"
                      />
                      {graphSearchQuery && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setGraphSearchQuery(''); }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white flex items-center justify-center"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Filter Category */}
                    <div className="flex items-center gap-2 mr-3">
                      <span className="text-[#888888] text-[10px]">FILTER:</span>
                      <select
                        value={graphCategoryFilter}
                        onChange={(e) => setGraphCategoryFilter(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="appearance-none bg-[#0c0c0e] border border-[#141416] rounded-lg pl-3 pr-8 h-8 text-xs text-white focus:outline-none cursor-pointer focus:border-white/50 font-mono bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23888888%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_auto] bg-[right_0.6rem_center] bg-no-repeat"
                      >
                        {['All', 'Business', 'Product', 'Marketing', 'Technical', 'Resources', 'Execution'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                  </div>

                  {/* Canvas Viewport */}
                  <div 
                    id="graph-canvas-viewport" 
                    className={`flex-grow relative overflow-hidden min-h-0 select-none ${
                      isGraphFullscreen ? 'graph-fullscreen-mode' : ''
                    }`}
                  >
                    {/* Floating Close Button in Fullscreen Mode */}
                    {isGraphFullscreen && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setIsGraphFullscreen(false); }}
                        title="Close Fullscreen (Esc)"
                        className="absolute left-4 top-4 z-[999] p-2 bg-black/60 border border-[#141416] hover:bg-white hover:text-black hover:border-white text-white rounded-lg transition-all cursor-pointer font-mono text-xs uppercase flex items-center gap-1.5"
                      >
                        <span>× CLOSE_FULLSCREEN</span>
                      </button>
                    )}

                    {/* Floating Legend */}
                    {activeGraphView === 'graph' && !isSidebarOpen && (
                      <div className="graph-legend absolute bottom-4 left-4 z-[999] flex flex-wrap items-center gap-4 p-2.5 bg-[#08080b]/70 backdrop-blur-md border border-[#141416] rounded-xl shadow-lg font-mono text-[9px] select-none text-[#888888]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-[1.5px] bg-[#888888] rounded-full"></span>
                          <span className="text-slate-300 font-bold">Parent / Depends On</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-[1.5px] border-b border-dashed border-[#888888]"></span>
                          <span className="text-slate-300 font-bold">Influences</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-[1.5px] border-b border-dotted border-[#888888]"></span>
                          <span className="text-slate-300 font-bold">References</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          <span className="text-slate-100 font-bold">Active Flow</span>
                        </div>
                      </div>
                    )}

                    {/* Floating Toolbar */}
                    {activeGraphView === 'graph' && (
                      <div className="graph-toolbar absolute bottom-4 right-4 z-[999] flex items-center gap-1.5 p-1 bg-[#08080b]/60 backdrop-blur-md border border-[#141416] rounded-xl shadow-lg font-mono text-xs select-none">
                        
                        {/* Zoom Out */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                          title="Zoom Out (-)"
                          className="p-2 hover:bg-white hover:text-black rounded-lg transition-all text-[#888888] cursor-pointer bg-transparent border-0 flex items-center justify-center active:scale-95"
                        >
                          <ZoomOut size={14} strokeWidth={2} />
                        </button>

                        {/* Zoom Percentage */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setZoomScale(0.82); }}
                          title="Reset Zoom to 82%"
                          className="px-2 py-1 hover:bg-white hover:text-black rounded-md transition-all text-slate-300 font-bold font-mono text-[10px] cursor-pointer bg-transparent border-0 active:scale-95"
                        >
                          {Math.round(zoomScale * 100)}%
                        </button>

                        {/* Zoom In */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                          title="Zoom In (+)"
                          className="p-2 hover:bg-white hover:text-black rounded-lg transition-all text-[#888888] cursor-pointer bg-transparent border-0 flex items-center justify-center active:scale-95"
                        >
                          <ZoomIn size={14} strokeWidth={2} />
                        </button>

                        <span className="w-[1px] h-4 bg-[#141416]"></span>

                        {/* Center Graph */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleFitGraph(); }}
                          title="Center Graph perfectly (⤢)"
                          className="p-2 hover:bg-white hover:text-black rounded-lg transition-all text-[#888888] cursor-pointer bg-transparent border-0 flex items-center justify-center active:scale-95"
                        >
                          <Compass size={14} strokeWidth={2} />
                        </button>

                        {/* Fullscreen Toggle */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setIsGraphFullscreen(!isGraphFullscreen); }}
                          title={isGraphFullscreen ? "Exit Fullscreen (⛶)" : "Fullscreen Graph (⛶)"}
                          className="p-2 hover:bg-white hover:text-black rounded-lg transition-all text-[#888888] cursor-pointer bg-transparent border-0 flex items-center justify-center active:scale-95"
                        >
                          <Maximize2 size={14} strokeWidth={2} />
                        </button>

                      </div>
                    )}

                    {activeGraphView === 'graph' ? (
                      <div
                        ref={graphContainerRef}
                        className="absolute inset-0 cursor-grab active:cursor-grabbing"
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseLeave={handleCanvasMouseUp}
                        onTouchStart={handleCanvasTouchStart}
                        onTouchMove={handleCanvasTouchMove}
                        onTouchEnd={handleCanvasTouchEnd}
                      >
                        <svg
                          className="w-full h-full absolute inset-0"
                          id="graph-canvas-svg"
                        >
                          {/* Background Grid Pattern */}
                          <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
                            </pattern>
                          </defs>
                          <rect
                            id="canvas-bg"
                            width="100%"
                            height="100%"
                            fill="url(#grid)"
                          />
                          
                          {/* Inner Panned / Zoomed group wrapper */}
                          <g
                            transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomScale})`}
                            className={`transition-transform ease-out ${isDraggingCanvas ? 'duration-[75ms]' : 'duration-300'}`}
                          >
                            {/* 1. Connection Edges */}
                            {graphRelations
                              .filter(r => {
                                const sourceNode = graphNodes.find(n => n.id === r.source);
                                const targetNode = graphNodes.find(n => n.id === r.target);
                                if (!sourceNode || !targetNode) return false;
                                
                                // Hide if category of either endpoint is collapsed
                                if (collapsedGroups.includes(sourceNode.category) || collapsedGroups.includes(targetNode.category)) {
                                  return false;
                                }

                                // Hide if filter is active and doesn't match either node category
                                if (graphCategoryFilter !== 'All') {
                                  if (sourceNode.category !== graphCategoryFilter && targetNode.category !== graphCategoryFilter) {
                                    return false;
                                  }
                                }

                                return true;
                              })
                              .map((r, idx) => {
                                const sourceNode = graphNodes.find(n => n.id === r.source)!;
                                const targetNode = graphNodes.find(n => n.id === r.target)!;
                                
                                const isSelectedPath = selectedNodeId && 
                                  (selectedNodeId === r.source || selectedNodeId === r.target);
                                
                                const { nodeIds: connectedNodeIds, edgeKeys: connectedEdgeKeys } = getConnectedNodesAndEdges(selectedNodeId);
                                const isHighlightedPath = selectedNodeId && connectedEdgeKeys.has(`${r.source}_${r.target}`);

                                // Define line styling based on connection types
                                let dashStyle = "";
                                if (r.type === 'Influences') dashStyle = "5,5";
                                if (r.type === 'References') dashStyle = "2,3";
                                if (r.type === 'Blocks') dashStyle = "10,5,2,5";

                                return (
                                  <g key={idx}>
                                    <path
                                      d={`M ${sourceNode.x} ${sourceNode.y} L ${targetNode.x} ${targetNode.y}`}
                                      stroke={isHighlightedPath ? '#ffffff' : (selectedNodeId ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.22)')}
                                      strokeWidth={isHighlightedPath ? 1.5 : (selectedNodeId ? 0.8 : 1.2)}
                                      strokeDasharray={dashStyle}
                                      className="transition-all duration-300 fill-none graph-link-unstable"
                                      style={{ animationDelay: `${(idx * 0.4).toFixed(2)}s` }}
                                    />
                                    {/* Animated moving dot on highlighted paths */}
                                    {isHighlightedPath && (
                                      <circle r="3" fill="#ffffff" className="shadow-[0_0_8px_#ffffff]">
                                        <animateMotion 
                                          dur="2.5s" 
                                          repeatCount="indefinite" 
                                          path={`M ${sourceNode.x} ${sourceNode.y} L ${targetNode.x} ${targetNode.y}`} 
                                        />
                                      </circle>
                                    )}
                                  </g>
                                );
                              })}

                            {/* 2. Graph Nodes */}
                            {graphNodes
                              .filter(n => {
                                // Filter by search queries
                                if (graphSearchQuery && !n.name.toLowerCase().includes(graphSearchQuery.toLowerCase())) {
                                  return false;
                                }
                                // Filter by selected categories dropdown
                                if (graphCategoryFilter !== 'All' && n.category !== graphCategoryFilter) {
                                  return false;
                                }
                                // Hide if parent category is collapsed
                                if (collapsedGroups.includes(n.category)) {
                                  return false;
                                }
                                return true;
                              })
                              .map((n, idx) => {
                                const isSelected = selectedNodeId === n.id;
                                const { nodeIds: connectedNodeIds } = getConnectedNodesAndEdges(selectedNodeId);
                                const isHighlighted = !selectedNodeId || connectedNodeIds.has(n.id);
                                
                                return (
                                  <g
                                    key={n.id}
                                    transform={`translate(${n.x}, ${n.y})`}
                                    onClick={(e) => { e.stopPropagation(); setSelectedNodeId(isSelected ? null : n.id); }}
                                    className="cursor-pointer group"
                                  >
                                      {/* Background glowing rings */}
                                      {isSelected && (
                                        <circle
                                          r="24"
                                          className="fill-none stroke-white/20 stroke-1 animate-ping"
                                        />
                                      )}
                                      
                                      {/* Main Node Bubble */}
                                      <circle
                                        r="18"
                                        className={`transition-all duration-300 stroke-[#141416] ${
                                          isSelected 
                                            ? 'fill-white stroke-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
                                            : isHighlighted 
                                              ? 'fill-[#0c0c0e] stroke-white/20 hover:stroke-white/60 hover:fill-[#111115]' 
                                              : 'fill-[#050507] stroke-white/5 opacity-30'
                                        }`}
                                        strokeWidth="1.5"
                                      />
                                      
                                      {/* Category letter glyph inside circle */}
                                      <text
                                        dy="4"
                                        textAnchor="middle"
                                        className={`font-mono text-[10px] font-bold select-none transition-colors duration-300 ${
                                          isSelected ? 'fill-black' : 'fill-slate-300'
                                        }`}
                                      >
                                        {n.category.substring(0, 1).toUpperCase()}
                                      </text>

                                      {/* Floating Node Label */}
                                      <text
                                        y="32"
                                        textAnchor="middle"
                                        className={`font-mono text-[9px] font-bold tracking-wider select-none transition-all duration-300 ${
                                          isSelected ? 'fill-white' : isHighlighted ? 'fill-slate-400 group-hover:fill-white' : 'fill-[#333]'
                                        }`}
                                      >
                                        {n.name}
                                      </text>
                                  </g>
                                );
                              })}
                          </g>
                        </svg>
                      </div>
                    ) : (
                      /* List View layout alternative */
                      <div className="w-full h-full overflow-y-auto p-4 flex flex-col gap-2 min-h-0">
                        <div className="bg-[#0c0c0e] border border-[#141416] rounded-lg overflow-hidden flex flex-col">
                          <table className="w-full border-collapse text-left font-mono text-[11px] text-[#888888]">
                            <thead>
                              <tr className="bg-black/50 border-b border-[#141416] text-slate-200">
                                <th className="p-3">NODE NAME</th>
                                <th className="p-3">CATEGORY</th>
                                <th className="p-3">COMPLETION</th>
                                <th className="p-3">STATUS</th>
                                <th className="p-3">CONNECTED FILES</th>
                              </tr>
                            </thead>
                            <tbody>
                              {graphNodes
                                .filter(n => {
                                  if (graphSearchQuery && !n.name.toLowerCase().includes(graphSearchQuery.toLowerCase())) return false;
                                  if (graphCategoryFilter !== 'All' && n.category !== graphCategoryFilter) return false;
                                  return true;
                                })
                                .map((n) => (
                                  <tr
                                    key={n.id}
                                    onClick={() => setSelectedNodeId(n.id)}
                                    className={`border-b border-[#141416]/50 hover:bg-white/5 transition-all cursor-pointer ${
                                      selectedNodeId === n.id ? 'bg-white/5 text-white' : ''
                                    }`}
                                  >
                                    <td className="p-3 font-bold text-slate-100">{n.name}</td>
                                    <td className="p-3">{n.category.toUpperCase()}</td>
                                    <td className="p-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-16 bg-[#111115] h-1.5 rounded-full overflow-hidden">
                                          <div className="bg-white h-full" style={{ width: `${n.pct}%` }}></div>
                                        </div>
                                        <span>{n.pct}%</span>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        n.status === 'STABLE' ? 'bg-white/10 text-slate-300' :
                                        n.status === 'ACTIVE' ? 'bg-white text-black' :
                                        n.status === 'IN_PROGRESS' ? 'border border-dashed border-white/40 text-slate-100' :
                                        'text-neutral-500 bg-transparent'
                                      }`}>
                                        {n.status}
                                      </span>
                                    </td>
                                    <td className="p-3 text-[10px] truncate max-w-[150px]">{n.docs.join(', ')}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Legend Card */}
                {activeGraphView === 'graph' && !isGraphFullscreen && (
                  <div className="mobile-legend-card bg-[#08080b] border border-[#141416] p-4 rounded-xl flex flex-col gap-3">
                    <div className="border-b border-[#141416] pb-2">
                      <h3 className="text-xs text-white font-bold uppercase font-mono tracking-wider">Graph Legend</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3.5 font-mono text-[10px] text-[#888888]">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-[1.5px] bg-[#888888] rounded-full shrink-0"></span>
                        <span className="text-slate-300 font-bold">Parent / Depends On</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-[1.5px] border-b border-dashed border-[#888888] shrink-0"></span>
                        <span className="text-slate-300 font-bold">Influences</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-[1.5px] border-b border-dotted border-[#888888] shrink-0"></span>
                        <span className="text-slate-300 font-bold">References</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0"></span>
                        <span className="text-slate-100 font-bold">Active Flow</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Right Panel: Selected node details info & Legend */}
                <div className={`w-full ${isSidebarOpen ? 'flex-grow min-h-0' : 'md:w-[260px]'} shrink-0 flex flex-col gap-4 min-w-0 graph-right-panel`}>
                  
                  {/* Selected Node info details */}
                  <div className={`bg-[#08080b] border border-[#141416] p-4 rounded-xl flex flex-col gap-3.5 ${isSidebarOpen ? '' : 'flex-grow min-h-0 overflow-y-auto no-scrollbar'}`}>
                    {selectedNodeId ? (() => {
                      const selectedNode = graphNodes.find(n => n.id === selectedNodeId)!;
                      const upstream = graphRelations.filter(r => r.target === selectedNodeId);
                      const downstream = graphRelations.filter(r => r.source === selectedNodeId);
                      
                      return (
                        <div className="flex flex-col gap-3 font-mono text-[11px] leading-relaxed">
                          <div className="border-b border-[#141416] pb-2 flex justify-between items-start">
                            <div>
                              <h3 className="text-xs text-white font-bold uppercase">{selectedNode.name}</h3>
                              <span className="text-[#666] text-[9px] uppercase tracking-wider">{selectedNode.category}</span>
                            </div>
                            <span className="text-[10px] font-bold text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded">
                              {selectedNode.pct}%
                            </span>
                          </div>

                          <div className="flex flex-col gap-1 text-[#888888]">
                            <span className="text-[9px] text-[#666] uppercase">Node Description</span>
                            <p className="text-[10px] leading-relaxed text-slate-300">{selectedNode.desc}</p>
                          </div>

                          <div className="flex justify-between items-center text-[#888888]">
                            <span className="text-[9px] text-[#666] uppercase">Module Status</span>
                            <span className="text-slate-200 font-bold">{selectedNode.status}</span>
                          </div>

                          <div className="flex flex-col gap-1 text-[#888888]">
                            <span className="text-[9px] text-[#666] uppercase">Linked Files</span>
                            <div className="flex flex-col gap-1 mt-0.5">
                              {selectedNode.docs.map((doc, idx) => (
                                <div key={idx} className="bg-black/30 border border-[#141416] px-2 py-1 rounded text-slate-300 truncate">
                                  📄 {doc}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 text-[#888888]">
                            <span className="text-[9px] text-[#666] uppercase">Relationships</span>
                            <div className="flex flex-col gap-1 mt-0.5 max-h-[100px] overflow-y-auto no-scrollbar">
                              {upstream.map((r, idx) => {
                                const src = graphNodes.find(n => n.id === r.source)!;
                                return (
                                  <div key={idx} className="flex justify-between items-center bg-[#0c0c0e] px-2 py-1 rounded border border-[#141416] text-[9px]">
                                    <span className="text-slate-200 truncate max-w-[80px]">{src.name}</span>
                                    <span className="text-[#666] italic">{r.type.toLowerCase()} this</span>
                                  </div>
                                );
                              })}
                              {downstream.map((r, idx) => {
                                const target = graphNodes.find(n => n.id === r.target)!;
                                return (
                                  <div key={idx} className="flex justify-between items-center bg-[#0c0c0e] px-2 py-1 rounded border border-[#141416] text-[9px]">
                                    <span className="text-[#666] italic">this {r.type.toLowerCase()}</span>
                                    <span className="text-slate-200 truncate max-w-[80px]">{target.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 text-[#888888]">
                            <span className="text-[9px] text-[#666] uppercase">Recent Log updates</span>
                            <p className="text-[10px] text-slate-400 italic">"{selectedNode.updates}"</p>
                          </div>

                          <button 
                            onClick={(e) => { e.stopPropagation(); logSystemMessage(`Opened workspace module domain: ${selectedNode.name}`); }}
                            className="w-full font-mono text-[10px] px-3.5 py-2 border border-[#141416] bg-[#0c0c0e] hover:bg-white hover:text-black hover:border-white transition-all rounded cursor-pointer mt-1 font-bold text-center"
                          >
                            Open Workspace
                          </button>
                        </div>
                      );
                    })() : (
                      <div className="flex-grow flex flex-col justify-center items-center text-center p-6 text-[#555] italic text-xs font-mono">
                        Select a node on the canvas layout to inspect dependency connections and files registry.
                      </div>
                    )}
                  </div>


                </div>
              </div>
            </div>
          </div>
      </div>

      {/* Right Collapsible Agent Hub Sidebar */}
      <div className={`agent-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="main-header flex items-center p-4 border-b border-[#141416]">
          <div className="main-title-group">
            <h2 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              Agent Hub
            </h2>
          </div>
        </div>
        
        {/* Agent tabs selection */}
        <div className="flex gap-1.5 p-3 border-b border-[#141416] overflow-x-auto no-scrollbar shrink-0 bg-[#08080b]">
          {agentsRegistry.map((ag) => (
            <button
              key={ag.key}
              onClick={() => handleSelectAgent(ag.key)}
              className={`px-2.5 py-1.5 rounded-lg border font-mono text-[11px] cursor-pointer flex items-center gap-1.5 transition-all shrink-0 ${
                activeAgent === ag.key
                  ? 'bg-white text-black border-white'
                  : 'bg-[#09090b] border-[#141416] text-[#888888]'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded text-[8px] flex items-center justify-center font-bold border ${
                  activeAgent === ag.key
                    ? 'bg-black text-white border-black'
                    : 'bg-[#16161c] text-[#f1f5f9] border-[#141416]'
                }`}
              >
                {ag.char}
              </span>
              {ag.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Chat log body — powered by AgentChat with ThinkingOrb */}
        <AgentChat
          activeAgentKey={activeAgent}
          initialMessages={chatMessages.map((m): AgentChatMessage => ({
            id: m.id,
            type: m.type === 'agent' ? 'assistant' : m.type,
            text: m.text,
            agentKey: m.agentKey,
            agentChar: m.agentChar,
            agentName: m.agentName,
            time: m.time,
          }))}
          onSystemLog={logSystemMessage}
        />
      </div>



      <footer className="fixed bottom-0 left-0 right-0 h-16 flex justify-center items-center bg-black/60 backdrop-blur-md border-t border-[#141416] z-[90]">
        <div className="flex bg-[#08080b] border border-[#141416] rounded-xl p-1 gap-1.5 max-w-full overflow-x-auto no-scrollbar">
          {[
            { key: 'actions', icon: Zap, label: 'ACTION_CENTER' },
            { key: 'progress', icon: Rocket, label: 'PROGRESS' },
            { key: 'documents', icon: FileText, label: 'DOC_TRACKER' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleModuleChange(tab.key)}
              className={`font-mono text-xs font-bold h-9 px-4 rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
                activeModule === tab.key
                  ? 'bg-white text-black font-bold'
                  : 'bg-transparent text-[#888888] hover:text-white hover:bg-[#111115]'
              }`}
            >
               <tab.icon
                size={18}
                strokeWidth={1.8}
                className="w-[18px] h-[18px] shrink-0"
              />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
