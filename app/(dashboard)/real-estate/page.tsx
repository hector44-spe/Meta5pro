"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  CreditCard,
  ChevronLeft,
  ChevronDown,
  X,
  FileText,
  Download,
  Building2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import {
  OPEN_REAL_ESTATE_PROJECTS,
  CLOSED_REAL_ESTATE_PROJECTS,
  REAL_ESTATE_HOW_IT_WORKS,
  type RealEstateProject,
} from "@/data/realEstateData";
import "@/styles/real-estate-page.css";

interface UserRealEstateInvestment {
  id: string;
  projectId: string;
  projectTitle: string;
  thumbnail: string;
  amount: number;
  roi: number;
  strategy: string;
  durationMonths: number;
  startDate: string;
  projectedReturn: number;
  status: "ACTIVE" | "COMPLETED";
}

export default function RealEstateDashboardPage() {
  const {
    openModal,
    hideBalance,
    setHideBalance,
    currentBalance,
    refreshBalance,
  } = useDashboard();

  // Active Main Tab: "open" | "closed" | "history" | "how_it_works"
  const [activeTab, setActiveTab] = useState<
    "open" | "closed" | "history" | "how_it_works"
  >("open");

  // Indicator style for animated switcher
  const [tabIndicatorStyle, setTabIndicatorStyle] = useState({
    left: "0px",
    width: "60px",
  });

  const openTabRef = useRef<HTMLButtonElement>(null);
  const closedTabRef = useRef<HTMLButtonElement>(null);
  const historyTabRef = useRef<HTMLButtonElement>(null);
  const howItWorksTabRef = useRef<HTMLButtonElement>(null);

  // Tab indicator measurement
  useEffect(() => {
    let targetRef: HTMLButtonElement | null = null;
    if (activeTab === "open") targetRef = openTabRef.current;
    else if (activeTab === "closed") targetRef = closedTabRef.current;
    else if (activeTab === "history") targetRef = historyTabRef.current;
    else if (activeTab === "how_it_works") targetRef = howItWorksTabRef.current;

    if (targetRef) {
      setTabIndicatorStyle({
        left: `${targetRef.offsetLeft}px`,
        width: `${targetRef.offsetWidth}px`,
      });
    }
  }, [activeTab]);

  // Project Drawer State
  const [selectedProjectForView, setSelectedProjectForView] =
    useState<RealEstateProject | null>(null);
  const [projectViewTab, setProjectViewTab] = useState<"project" | "documents">(
    "project"
  );

  // Invest Modal State
  const [selectedProjectForInvest, setSelectedProjectForInvest] =
    useState<RealEstateProject | null>(null);
  const [investInput, setInvestInput] = useState<string>("");
  const [investDuration, setInvestDuration] = useState<number>(12); // months
  const [isSubmittingInvest, setIsSubmittingInvest] = useState<boolean>(false);
  const [investError, setInvestError] = useState<string | null>(null);

  // User's Real Estate Investments
  const [userInvestments, setUserInvestments] = useState<
    UserRealEstateInvestment[]
  >([]);

  // Open projects list & Admin status
  const [openProjects, setOpenProjects] = useState<RealEstateProject[]>(
    OPEN_REAL_ESTATE_PROJECTS
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Admin Project Edit Modal State
  const [editingProject, setEditingProject] =
    useState<RealEstateProject | null>(null);
  const [editMin, setEditMin] = useState<string>("12000");
  const [editRoi, setEditRoi] = useState<string>("85");
  const [editMinDuration, setEditMinDuration] = useState<string>("1");
  const [editMinDurationUnit, setEditMinDurationUnit] = useState<
    "DAY" | "WEEK" | "MONTH" | "YEAR"
  >("DAY");
  const [editMaxDuration, setEditMaxDuration] = useState<string>("1");
  const [editMaxDurationUnit, setEditMaxDurationUnit] = useState<
    "DAY" | "WEEK" | "MONTH" | "YEAR"
  >("YEAR");
  const [isSavingProject, setIsSavingProject] = useState<boolean>(false);
  const [isDeletingProject, setIsDeletingProject] = useState<boolean>(false);

  // Load projects and verify admin status
  useEffect(() => {
    let isMounted = true;
    async function loadProjectsAndAuth() {
      try {
        const res = await fetch("/api/real-estate/projects");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.projects && Array.isArray(data.projects)) {
              setOpenProjects(data.projects);
            }
            if (typeof data.isAdmin === "boolean") {
              setIsAdmin(data.isAdmin);
            }
          }
        }
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          if (params.get("admin") === "true" || localStorage.getItem("mg5_admin_preview") === "true") {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error("Failed to load estate projects:", err);
      }
    }
    loadProjectsAndAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenEditModal = (project: RealEstateProject) => {
    setEditingProject(project);
    setEditMin(String(project.minimum));
    setEditRoi(String(project.roi));
    setEditMinDuration(String(project.minDuration || 1));
    setEditMinDurationUnit(project.minDurationUnit || "DAY");
    setEditMaxDuration(String(project.maxDuration || 1));
    setEditMaxDurationUnit(project.maxDurationUnit || "YEAR");
  };

  const handleCloseEditModal = () => {
    setEditingProject(null);
  };

  const handleSaveProjectEdit = async () => {
    if (!editingProject) return;
    const minVal = parseFloat(editMin);
    const roiVal = parseFloat(editRoi);
    const minDurVal = parseInt(editMinDuration, 10) || 1;
    const maxDurVal = parseInt(editMaxDuration, 10) || 1;

    if (isNaN(minVal) || minVal <= 0) {
      alert("Please enter a valid minimum investment amount.");
      return;
    }
    if (isNaN(roiVal) || roiVal <= 0) {
      alert("Please enter a valid ROI percentage.");
      return;
    }

    setIsSavingProject(true);
    try {
      const updatedProject: RealEstateProject = {
        ...editingProject,
        minimum: minVal,
        roi: roiVal,
        minDuration: minDurVal,
        minDurationUnit: editMinDurationUnit,
        maxDuration: maxDurVal,
        maxDurationUnit: editMaxDurationUnit,
      };

      const res = await fetch("/api/real-estate/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          project: updatedProject,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save project");
      }

      const data = await res.json();
      if (data.projects) {
        setOpenProjects(data.projects);
      } else {
        setOpenProjects((prev) =>
          prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
        );
      }

      setToastMessage(`Project "${updatedProject.title}" updated successfully!`);
      setTimeout(() => setToastMessage(null), 5000);
      setEditingProject(null);
    } catch (err: any) {
      alert(err.message || "Failed to save project");
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!editingProject) return;
    if (!confirm(`Are you sure you want to delete "${editingProject.title}"?`)) {
      return;
    }

    setIsDeletingProject(true);
    try {
      const res = await fetch("/api/real-estate/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          projectId: editingProject.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete project");
      }

      const data = await res.json();
      if (data.projects) {
        setOpenProjects(data.projects);
      } else {
        setOpenProjects((prev) =>
          prev.filter((p) => p.id !== editingProject.id)
        );
      }

      setToastMessage(`Project "${editingProject.title}" removed!`);
      setTimeout(() => setToastMessage(null), 5000);
      setEditingProject(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete project");
    } finally {
      setIsDeletingProject(false);
    }
  };

  // Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // FAQ open question accordion state
  const [openQuestionId, setOpenQuestionId] = useState<number | null>(1);

  // Initialize investments from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mg5_real_estate_investments");
      if (saved) {
        setUserInvestments(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save investments to localStorage when updated
  const saveInvestments = (newInv: UserRealEstateInvestment[]) => {
    setUserInvestments(newInv);
    try {
      localStorage.setItem(
        "mg5_real_estate_investments",
        JSON.stringify(newInv)
      );
    } catch {
      // ignore
    }
  };

  // Calculate Real Estate Portfolio Value
  const portfolioValue = useMemo(() => {
    return userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  }, [userInvestments]);

  // Handle Opening the Invest Modal
  const handleOpenInvest = (project: RealEstateProject) => {
    setSelectedProjectForInvest(project);
    setInvestInput(project.minimum.toString());
    setInvestDuration(12);
    setInvestError(null);
  };

  // Invest calculations
  const parsedAmount = parseFloat(investInput) || 0;
  const projectedProfit = selectedProjectForInvest
    ? (parsedAmount * selectedProjectForInvest.roi) / 100
    : 0;
  const projectedTotalReturn = parsedAmount + projectedProfit;

  // Validate Amount on change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, "");
    setInvestInput(val);

    const num = parseFloat(val);
    if (selectedProjectForInvest && num < selectedProjectForInvest.minimum) {
      setInvestError(
        `Minimum investment is $${selectedProjectForInvest.minimum.toLocaleString()}`
      );
    } else if (num > currentBalance) {
      setInvestError(
        `Amount exceeds your available balance ($${currentBalance.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2 }
        )})`
      );
    } else {
      setInvestError(null);
    }
  };

  // Submit Investment
  const handleConfirmInvestment = async () => {
    if (!selectedProjectForInvest) return;
    if (parsedAmount < selectedProjectForInvest.minimum) {
      setInvestError(
        `Minimum investment is $${selectedProjectForInvest.minimum.toLocaleString()}`
      );
      return;
    }
    if (parsedAmount > currentBalance) {
      setInvestError(
        `Insufficient available funds. Please deposit into your wallet first.`
      );
      return;
    }

    setIsSubmittingInvest(true);

    // Simulate investment record creation
    setTimeout(() => {
      const newInv: UserRealEstateInvestment = {
        id: "re_" + Date.now().toString(36),
        projectId: selectedProjectForInvest.id,
        projectTitle: selectedProjectForInvest.title,
        thumbnail: selectedProjectForInvest.thumbnail,
        amount: parsedAmount,
        roi: selectedProjectForInvest.roi,
        strategy: selectedProjectForInvest.strategy,
        durationMonths: investDuration,
        startDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        projectedReturn: projectedTotalReturn,
        status: "ACTIVE",
      };

      const updated = [newInv, ...userInvestments];
      saveInvestments(updated);

      setIsSubmittingInvest(false);
      setSelectedProjectForInvest(null);
      if (selectedProjectForView) {
        setSelectedProjectForView(null);
      }

      setToastMessage(
        `Successfully invested $${parsedAmount.toLocaleString()} in ${
          selectedProjectForInvest.title
        }!`
      );
      setTimeout(() => setToastMessage(null), 5000);

      // Refresh balances if hooked
      refreshBalance();
    }, 1200);
  };

  return (
    <div className="real-estate-page-wrapper">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="real-estate-toast-banner">
          <CheckCircle2 size={18} />
          <p>{toastMessage}</p>
        </div>
      )}

      {/* Main Real Estate Card */}
      <div className="real-estate-content-card scrollbar-hide">
        {/* ===================== TOP: PORTFOLIO VALUE ===================== */}
        <div className="real_estate_top">
          <div className="real-estate-balance-box">
            <div>
              <span className="balance_label_wrapper">
                <p className="balance_label">Total portfolio value</p>
                <button
                  className="eyes_button"
                  onClick={() => setHideBalance((prev) => !prev)}
                  title={hideBalance ? "Show balance" : "Hide balance"}
                  aria-label="Toggle portfolio balance visibility"
                >
                  {hideBalance ? (
                    <EyeOff size={14} strokeWidth={1.5} className="eye" />
                  ) : (
                    <Eye size={14} strokeWidth={1.5} className="eye" />
                  )}
                </button>
              </span>

              {hideBalance ? (
                <h3 className="user_balance hidden">
                  <i>*</i>
                  <i>*</i>
                  <i>*</i>
                  <i>*</i>
                  <i>*</i>
                  <i>*</i>
                </h3>
              ) : (
                <h2 className="user_balance">
                  $
                  {portfolioValue.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </h2>
              )}
            </div>

            {/* Withdraw Button */}
            <button
              className="real-estate-withdraw-btn"
              onClick={() => openModal("withdraw")}
            >
              <CreditCard size={16} strokeWidth={2} />
              <p>Withdraw</p>
            </button>
          </div>
        </div>

        {/* ===================== BOTTOM: TABS & VIEWS ===================== */}
        <div className="real_estate_bottom">
          {/* Real Estate Tab Switcher */}
          <div className="real-estate-switcher">
            <div className="switcher_wrapper_inner">
              <button
                ref={openTabRef}
                className={`switcher_item ${
                  activeTab === "open" ? "active" : ""
                }`}
                onClick={() => setActiveTab("open")}
              >
                Open
              </button>
              <button
                ref={closedTabRef}
                className={`switcher_item ${
                  activeTab === "closed" ? "active" : ""
                }`}
                onClick={() => setActiveTab("closed")}
              >
                Closed
              </button>
              <button
                ref={historyTabRef}
                className={`switcher_item ${
                  activeTab === "history" ? "active" : ""
                }`}
                onClick={() => setActiveTab("history")}
              >
                Your investments
              </button>
              <button
                ref={howItWorksTabRef}
                className={`switcher_item ${
                  activeTab === "how_it_works" ? "active" : ""
                }`}
                onClick={() => setActiveTab("how_it_works")}
              >
                How it works
              </button>
              <div
                className="switcher_indicator"
                style={{
                  left: tabIndicatorStyle.left,
                  width: tabIndicatorStyle.width,
                }}
              />
            </div>
          </div>

          {/* ===================== TAB 1: OPEN PROJECTS ===================== */}
          {activeTab === "open" && (
            <div>
              <div className="projects_header">
                <p>Open projects</p>
              </div>

              <div className="realestate_grids">
                {openProjects.map((project) => (
                  <div key={project.id} className="realestate_card">
                    {/* Project Thumbnail Image */}
                    <div className="project_image_wrapper">
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="project_image"
                        loading="lazy"
                      />
                      {/* Admin Edit Button (Image 3: Admin only) */}
                      {isAdmin && (
                        <button
                          className="admin_edit_badge"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(project);
                          }}
                          title="Edit this project"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {/* Project Wrapper */}
                    <div className="project_wrapper">
                      <div className="project_details">
                        <p className="project_title">{project.title}</p>
                        <p className="project_description_text">
                          {project.description}
                        </p>
                      </div>

                      {/* Summary Metrics (Original Meta Gold design: Image 1 reference) */}
                      <div className="project_summary">
                        <span className="minimum">
                          <p>Minimum</p>
                          <p>
                            $
                            {project.minimum.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </span>
                        <span className="roi">
                          <p>ROI</p>
                          <p>{project.roi}%</p>
                        </span>
                        <span className="strategy">
                          <p>Strategy</p>
                          <p>{project.strategy}</p>
                        </span>
                      </div>

                      {/* Action Buttons: View project | Invest now */}
                      <div className="project_actions">
                        <button
                          className="btn_view_project"
                          onClick={() => {
                            setSelectedProjectForView(project);
                            setProjectViewTab("project");
                          }}
                        >
                          View project
                        </button>
                        <button
                          className="btn_invest_now"
                          onClick={() => handleOpenInvest(project)}
                        >
                          Invest now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB 2: CLOSED PROJECTS ===================== */}
          {activeTab === "closed" && (
            <div>
              <div className="projects_header">
                <p>Closed projects</p>
              </div>

              <div className="realestate_grids">
                {CLOSED_REAL_ESTATE_PROJECTS.map((project) => (
                  <div key={project.id} className="realestate_card">
                    <div className="project_image_wrapper">
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="project_image closed"
                        loading="lazy"
                      />
                      <span className="closed_badge">Closed</span>
                    </div>

                    <div className="project_wrapper">
                      <div className="project_details">
                        <p className="project_title">{project.title}</p>
                        <p className="project_description_text">
                          {project.description}
                        </p>
                      </div>

                      <div className="project_summary">
                        <span className="minimum">
                          <p>Minimum</p>
                          <p>
                            $
                            {project.minimum.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </span>
                        <span className="roi">
                          <p>ROI</p>
                          <p>{project.roi}%</p>
                        </span>
                        <span className="strategy">
                          <p>Strategy</p>
                          <p>{project.strategy}</p>
                        </span>
                      </div>

                      <div className="project_actions">
                        <button className="btn_closed" disabled>
                          Project closed
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB 3: YOUR INVESTMENTS ===================== */}
          {activeTab === "history" && (
            <div>
              <div className="projects_header">
                <p>Your investments</p>
              </div>

              {userInvestments.length === 0 ? (
                <div className="real_estate_empty_state">
                  <div className="empty_state_icon_wrapper">
                    <Building2 size={28} />
                  </div>
                  <h4>No active real estate investments</h4>
                  <p>
                    You have not subscribed to any real estate developments yet.
                    Browse our institutional projects and start earning projected
                    returns.
                  </p>
                  <button onClick={() => setActiveTab("open")}>
                    Explore open projects
                  </button>
                </div>
              ) : (
                <div className="realestate_grids">
                  {userInvestments.map((inv) => (
                    <div key={inv.id} className="realestate_card">
                      <div className="project_image_wrapper">
                        <img
                          src={inv.thumbnail}
                          alt={inv.projectTitle}
                          className="project_image"
                        />
                        <span
                          style={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            background: "rgba(1, 178, 139, 0.9)",
                            color: "#ffffff",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.5px",
                          }}
                        >
                          Active
                        </span>
                      </div>

                      <div className="project_wrapper">
                        <div className="project_details">
                          <p className="project_title">{inv.projectTitle}</p>
                          <p
                            style={{
                              fontSize: "12.5px",
                              color: "rgba(255, 255, 255, 0.5)",
                              marginTop: "4px",
                            }}
                          >
                            Invested on {inv.startDate} • {inv.durationMonths}{" "}
                            months term
                          </p>
                        </div>

                        <div className="project_summary">
                          <span className="minimum">
                            <p>Capital invested</p>
                            <p>${inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                          </span>
                          <span className="roi">
                            <p>Target ROI</p>
                            <p>{inv.roi}%</p>
                          </span>
                          <span className="strategy">
                            <p>Projected return</p>
                            <p style={{ color: "#01b28b" }}>
                              ${inv.projectedReturn.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </p>
                          </span>
                        </div>

                        <div className="project_actions" style={{ marginTop: "16px" }}>
                          <button
                            className="btn_view_project"
                            style={{ width: "100%" }}
                            onClick={() => {
                              const found = OPEN_REAL_ESTATE_PROJECTS.find(
                                (p) => p.id === inv.projectId
                              );
                              if (found) {
                                setSelectedProjectForView(found);
                                setProjectViewTab("project");
                              }
                            }}
                          >
                            View project details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 4: HOW IT WORKS ===================== */}
          {activeTab === "how_it_works" && (
            <div className="how_it_works_view">
              <div className="how_it_works_header">
                <p>How it works</p>
              </div>

              <div className="how_it_works_content">
                <div className="questions_wrapper">
                  {REAL_ESTATE_HOW_IT_WORKS.map((q) => {
                    const isOpen = openQuestionId === q.id;
                    return (
                      <div
                        key={q.id}
                        className={`question_item ${isOpen ? "open" : ""}`}
                        onClick={() =>
                          setOpenQuestionId(isOpen ? null : q.id)
                        }
                      >
                        <div className="question_header">
                          <div className="question_header_left">
                            <div className="question_number">
                              <p>{q.id}</p>
                            </div>
                            <p className="question_title">{q.title}</p>
                          </div>
                          <ChevronDown
                            size={16}
                            className="question_chevron"
                          />
                        </div>

                        {isOpen && (
                          <div className="question_answer">
                            <p>{q.content}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===================== SLIDE-OVER DRAWER (PROJECT VIEW) ===================== */}
      {selectedProjectForView && (
        <>
          <div
            className="project_view_backdrop"
            onClick={() => setSelectedProjectForView(null)}
          />

          <div className="project_view_drawer scrollbar-hide">
            {/* Drawer Header */}
            <div className="project_view_top">
              <button
                className="project_view_back_btn"
                onClick={() => setSelectedProjectForView(null)}
              >
                <ChevronLeft size={18} />
                <span>Back to projects</span>
              </button>
              <button
                className="project_view_close_btn"
                onClick={() => setSelectedProjectForView(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="project_view_content">
              {/* Hero Image */}
              <img
                src={selectedProjectForView.thumbnail}
                alt={selectedProjectForView.title}
                className="project_view_hero_image"
              />

              {/* Title & Description */}
              <div className="project_view_title_section">
                <h2>{selectedProjectForView.title}</h2>
                <p>{selectedProjectForView.description}</p>
              </div>

              {/* Summary Cards */}
              <div className="project_view_summary_cards">
                <div className="project_view_summary_col">
                  <p>Minimum</p>
                  <p>
                    $
                    {selectedProjectForView.minimum.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="project_view_summary_col">
                  <p>Expected ROI</p>
                  <p>{selectedProjectForView.roi}%</p>
                </div>
                <div className="project_view_summary_col">
                  <p>Strategy</p>
                  <p>{selectedProjectForView.strategy}</p>
                </div>
              </div>

              {/* Sub Switcher: This project vs Documents */}
              <div className="inner_switcher_wrapper">
                <button
                  className={`inner_switcher_btn ${
                    projectViewTab === "project" ? "active" : ""
                  }`}
                  onClick={() => setProjectViewTab("project")}
                >
                  This project
                </button>
                <button
                  className={`inner_switcher_btn ${
                    projectViewTab === "documents" ? "active" : ""
                  }`}
                  onClick={() => setProjectViewTab("documents")}
                >
                  Documents
                </button>
              </div>

              {/* Sub-view: This Project Overview */}
              {projectViewTab === "project" && (
                <>
                  <div>
                    <h4 className="project_view_section_heading">Overview</h4>
                    <p
                      style={{
                        fontSize: "13.5px",
                        lineHeight: 1.6,
                        color: "rgba(255, 255, 255, 0.75)",
                      }}
                    >
                      {selectedProjectForView.overview}
                    </p>
                  </div>

                  <div>
                    <h4 className="project_view_section_heading">
                      Property Breakdown
                    </h4>
                    <div className="project_view_breakdown_grid">
                      {selectedProjectForView.breakdown.map((item, idx) => (
                        <div key={idx} className="breakdown_item">
                          <p>{item.name}</p>
                          <p>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="project_view_section_heading">
                      Why this property
                    </h4>
                    <div className="highlights_list">
                      {selectedProjectForView.whyThisProperty.map((point, i) => (
                        <div key={i} className="highlight_item">
                          <span className="highlight_bullet" />
                          <p>{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="project_view_section_heading">
                      Why this sponsor
                    </h4>
                    <div className="highlights_list">
                      {selectedProjectForView.whyThisSponsor.map((point, i) => (
                        <div key={i} className="highlight_item">
                          <span className="highlight_bullet" />
                          <p>{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Sub-view: Offering Documents */}
              {projectViewTab === "documents" && (
                <div>
                  <h4 className="project_view_section_heading">
                    Offering Documents
                  </h4>
                  <div className="documents_list">
                    {selectedProjectForView.documents.map((doc, idx) => (
                      <div key={idx} className="document_item">
                        <div className="doc_info">
                          <FileText size={18} color="#3861fb" />
                          <div>
                            <p className="doc_title">{doc.title}</p>
                            {doc.size && <p className="doc_size">{doc.size}</p>}
                          </div>
                        </div>
                        <Download size={16} color="rgba(255,255,255,0.6)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Drawer Footer */}
            {!selectedProjectForView.closedByDefault && (
              <div className="project_view_footer">
                <button
                  className="project_view_invest_btn"
                  onClick={() => {
                    handleOpenInvest(selectedProjectForView);
                  }}
                >
                  Invest in this project
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ===================== INVEST MODAL ===================== */}
      {selectedProjectForInvest && (
        <div className="invest_modal_overlay">
          <div className="invest_modal_container">
            {/* Modal Header */}
            <div className="invest_modal_header">
              <h3>Invest in {selectedProjectForInvest.title}</h3>
              <button
                className="invest_modal_close"
                onClick={() => setSelectedProjectForInvest(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Available Balance Banner */}
            <div className="invest_modal_balance_banner">
              <span>Available wallet balance:</span>
              <span>
                $
                {currentBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {/* Amount Input */}
            <div className="invest_input_group">
              <label>Investment amount (USD)</label>
              <div className="invest_input_wrapper">
                <span className="invest_input_prefix">$</span>
                <input
                  type="text"
                  className={`invest_input_field ${
                    investError ? "error" : ""
                  }`}
                  value={investInput}
                  onChange={handleAmountChange}
                  placeholder={`Min. $${selectedProjectForInvest.minimum.toLocaleString()}`}
                />
              </div>
              {investError ? (
                <p className="invest_error_text">{investError}</p>
              ) : (
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255, 255, 255, 0.45)",
                  }}
                >
                  Minimum requirement: $
                  {selectedProjectForInvest.minimum.toLocaleString()}
                </p>
              )}
            </div>

            {/* Duration Selector */}
            <div className="invest_input_group">
              <label>Investment horizon</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { label: "1 Year", months: 12 },
                  { label: "2 Years", months: 24 },
                  { label: "3 Years", months: 36 },
                ].map((d) => (
                  <button
                    key={d.months}
                    type="button"
                    style={{
                      flex: 1,
                      height: "38px",
                      borderRadius: "6px",
                      border:
                        investDuration === d.months
                          ? "1px solid #3861fb"
                          : "1px solid rgba(255, 255, 255, 0.1)",
                      background:
                        investDuration === d.months
                          ? "rgba(56, 97, 251, 0.15)"
                          : "rgba(255, 255, 255, 0.04)",
                      color:
                        investDuration === d.months ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
                      fontSize: "13px",
                      fontWeight: investDuration === d.months ? 600 : 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onClick={() => setInvestDuration(d.months)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Projected Returns Calculator */}
            <div className="invest_calculator_box">
              <div className="calc_row">
                <span>Committed principal:</span>
                <span>
                  $
                  {parsedAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="calc_row">
                <span>Target ROI rate:</span>
                <span style={{ color: "#3861fb" }}>
                  {selectedProjectForInvest.roi}%
                </span>
              </div>
              <div className="calc_row">
                <span>Target profit:</span>
                <span style={{ color: "#01b28b" }}>
                  +$
                  {projectedProfit.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="calc_row total">
                <span>Total return upon exit:</span>
                <span>
                  $
                  {projectedTotalReturn.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              className="invest_modal_confirm_btn"
              disabled={
                Boolean(investError) ||
                parsedAmount < selectedProjectForInvest.minimum ||
                isSubmittingInvest
              }
              onClick={handleConfirmInvestment}
            >
              {isSubmittingInvest ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing investment...</span>
                </>
              ) : (
                <span>Confirm Investment</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ===================== ADMIN EDIT PROJECT MODAL (Image 4: Admin only) ===================== */}
      {isAdmin && editingProject && (
        <div
          className="re_admin_modal_overlay"
          onClick={handleCloseEditModal}
        >
          <div
            className="re_admin_modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="re_admin_modal_header">
              <h3>Edit {editingProject.title}</h3>
              <button
                className="close_btn"
                onClick={handleCloseEditModal}
                aria-label="Close edit modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Minimum Investment Field */}
            <div className="re_admin_form_group">
              <label>Minimum:</label>
              <div className="re_admin_input_row">
                <input
                  type="number"
                  value={editMin}
                  onChange={(e) => setEditMin(e.target.value)}
                  placeholder="12000"
                />
                <span className="suffix">USD</span>
              </div>
            </div>

            {/* ROI Percentage Field */}
            <div className="re_admin_form_group">
              <label>ROI:</label>
              <div className="re_admin_input_row">
                <input
                  type="number"
                  value={editRoi}
                  onChange={(e) => setEditRoi(e.target.value)}
                  placeholder="85"
                />
                <span className="suffix">%</span>
              </div>
            </div>

            {/* Minimum Investment Duration Field */}
            <div className="re_admin_form_group">
              <label>Minimum investment duration:</label>
              <div className="re_admin_duration_row">
                <input
                  type="number"
                  value={editMinDuration}
                  onChange={(e) => setEditMinDuration(e.target.value)}
                  min={1}
                />
                <div className="re_admin_duration_unit_box">
                  <select
                    value={editMinDurationUnit}
                    onChange={(e) =>
                      setEditMinDurationUnit(
                        e.target.value as "DAY" | "WEEK" | "MONTH" | "YEAR"
                      )
                    }
                  >
                    <option value="DAY">DAY</option>
                    <option value="WEEK">WEEK</option>
                    <option value="MONTH">MONTH</option>
                    <option value="YEAR">YEAR</option>
                  </select>
                  <ChevronDown size={14} className="unit_chevron" />
                </div>
              </div>
            </div>

            {/* Maximum Investment Duration Field */}
            <div className="re_admin_form_group">
              <label>Maximum investment duration:</label>
              <div className="re_admin_duration_row">
                <input
                  type="number"
                  value={editMaxDuration}
                  onChange={(e) => setEditMaxDuration(e.target.value)}
                  min={1}
                />
                <div className="re_admin_duration_unit_box">
                  <select
                    value={editMaxDurationUnit}
                    onChange={(e) =>
                      setEditMaxDurationUnit(
                        e.target.value as "DAY" | "WEEK" | "MONTH" | "YEAR"
                      )
                    }
                  >
                    <option value="DAY">DAY</option>
                    <option value="WEEK">WEEK</option>
                    <option value="MONTH">MONTH</option>
                    <option value="YEAR">YEAR</option>
                  </select>
                  <ChevronDown size={14} className="unit_chevron" />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="re_admin_modal_actions">
              <button
                className="btn_delete_project"
                onClick={handleDeleteProject}
                disabled={isDeletingProject || isSavingProject}
              >
                {isDeletingProject ? "Deleting..." : "Delete project"}
              </button>
              <button
                className="btn_save_project"
                onClick={handleSaveProjectEdit}
                disabled={isSavingProject || isDeletingProject}
              >
                {isSavingProject ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
