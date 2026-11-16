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
import CustomConfirmModal, { CustomConfirmState } from "@/components/UI/CustomConfirmModal";
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
  const [investDuration, setInvestDuration] = useState<number>(1); // months
  const [investDurationStr, setInvestDurationStr] = useState<string>("20 days");
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
      setToastMessage("Please enter a valid minimum investment amount.");
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    if (isNaN(roiVal) || roiVal <= 0) {
      setToastMessage("Please enter a valid ROI percentage.");
      setTimeout(() => setToastMessage(null), 4000);
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
      setToastMessage(err.message || "Failed to save project");
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleDeleteProject = () => {
    if (!editingProject) return;
    setConfirmState({
      title: `Delete Project "${editingProject.title}"?`,
      message: `Are you sure you want to delete this real estate project? This action cannot be undone.`,
      confirmText: "Delete",
      danger: true,
      onConfirm: async () => {
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
          setToastMessage(err.message || "Failed to delete project");
          setTimeout(() => setToastMessage(null), 5000);
        } finally {
          setIsDeletingProject(false);
          setConfirmState(null);
        }
      },
    });
  };

  // Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<CustomConfirmState | null>(null);

  // FAQ open question accordion state
  const [openQuestionId, setOpenQuestionId] = useState<number | null>(1);

  // Fetch real estate investments from database
  const fetchUserInvestments = async () => {
    try {
      const res = await fetch("/api/real-estate/invest");
      if (res.ok) {
        const data = await res.json();
        if (data.investments) {
          setUserInvestments(data.investments);
        }
      }
    } catch (err) {
      console.error("Failed to fetch real estate investments:", err);
    }
  };

  useEffect(() => {
    fetchUserInvestments();
  }, []);

  // Calculate Real Estate Portfolio Value
  const portfolioValue = useMemo(() => {
    return userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  }, [userInvestments]);

  const DURATION_OPTIONS = [
    { label: "20 days", months: 1 },
    { label: "30 days", months: 1 },
    { label: "60 days", months: 2 },
    { label: "90 days", months: 3 },
    { label: "180 days", months: 6 },
    { label: "1 year", months: 12 },
    { label: "2 years", months: 24 },
  ];

  // Handle Opening the Invest Modal
  const handleOpenInvest = (project: RealEstateProject) => {
    setSelectedProjectForInvest(project);
    setInvestInput(project.minimum.toString());
    setInvestDuration(1);
    setInvestDurationStr("20 days");
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
        `Minimum investment is ${selectedProjectForInvest.minimum.toLocaleString()}`
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
    setInvestError(null);

    try {
      const res = await fetch("/api/real-estate/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectForInvest.id,
          projectTitle: selectedProjectForInvest.title,
          thumbnail: selectedProjectForInvest.thumbnail,
          amount: parsedAmount,
          roi: selectedProjectForInvest.roi,
          strategy: selectedProjectForInvest.strategy,
          durationMonths: investDuration,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit real estate investment");
      }

      if (data.investment) {
        setUserInvestments((prev) => [data.investment, ...prev]);
      } else {
        await fetchUserInvestments();
      }

      setSelectedProjectForInvest(null);
      if (selectedProjectForView) {
        setSelectedProjectForView(null);
      }

      setToastMessage(
        `Successfully invested ${parsedAmount.toLocaleString()} in ${
          selectedProjectForInvest.title
        }!`
      );
      setTimeout(() => setToastMessage(null), 5000);

      refreshBalance();
    } catch (err: any) {
      setInvestError(err.message || "Failed to complete investment");
    } finally {
      setIsSubmittingInvest(false);
    }
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

      {/* ===================== INVEST MODAL (EXACT VISUAL REPLICA OF IMAGE 2) ===================== */}
      {selectedProjectForInvest && (
        <div
          className="invest_modal_overlay"
          onClick={() => setSelectedProjectForInvest(null)}
        >
          <div
            className="invest_modal_container"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#12141a",
              border: "2px solid #2563eb",
              borderRadius: "16px",
              padding: "24px 22px",
              width: "100%",
              maxWidth: "430px",
              boxSizing: "border-box",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(37, 99, 235, 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "4px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 650,
                  color: "#ffffff",
                  margin: 0,
                  lineHeight: 1.3,
                  letterSpacing: "-0.01em",
                }}
              >
                Invest {selectedProjectForInvest.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedProjectForInvest(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.6)",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Field 1: Amount */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                style={{
                  fontSize: "13.5px",
                  fontWeight: 500,
                  color: "#9ca3af",
                  margin: 0,
                }}
              >
                Amount:
              </label>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  background: "#1c202a",
                  border: investError ? "1px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "8px",
                  height: "46px",
                  boxSizing: "border-box",
                  padding: "0 8px 0 14px",
                }}
              >
                <input
                  type="text"
                  value={investInput}
                  onChange={handleAmountChange}
                  placeholder={selectedProjectForInvest.minimum.toString()}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: 600,
                  }}
                />
                <span
                  style={{
                    background: "#272c38",
                    color: "#f1f5f9",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    flexShrink: 0,
                  }}
                >
                  USD
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "2px",
                  fontSize: "12.5px",
                }}
              >
                <span style={{ color: "#9ca3af" }}>Current USD balance:</span>
                <span style={{ color: "#ffffff", fontWeight: 500 }}>
                  ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>
              {investError && (
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#ef4444" }}>
                  {investError}
                </p>
              )}
            </div>

            {/* Field 2: Duration */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                style={{
                  fontSize: "13.5px",
                  fontWeight: 500,
                  color: "#9ca3af",
                  margin: 0,
                }}
              >
                Duration:
              </label>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  background: "#1c202a",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "8px",
                  height: "46px",
                  boxSizing: "border-box",
                }}
              >
                <select
                  value={investDurationStr}
                  onChange={(e) => {
                    setInvestDurationStr(e.target.value);
                    const opt = DURATION_OPTIONS.find((o) => o.label === e.target.value);
                    if (opt) setInvestDuration(opt.months);
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#ffffff",
                    fontSize: "14.5px",
                    fontWeight: 500,
                    padding: "0 34px 0 14px",
                    appearance: "none",
                    WebkitAppearance: "none",
                    cursor: "pointer",
                  }}
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.label} style={{ background: "#1c202a", color: "#ffffff" }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  color="rgba(255, 255, 255, 0.7)"
                  style={{ position: "absolute", right: "12px", pointerEvents: "none" }}
                />
              </div>
            </div>

            {/* Field 3: ROI */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                style={{
                  fontSize: "13.5px",
                  fontWeight: 500,
                  color: "#9ca3af",
                  margin: 0,
                }}
              >
                ROI:
              </label>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#1c202a",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "8px",
                  height: "46px",
                  boxSizing: "border-box",
                  padding: "0 8px 0 14px",
                }}
              >
                <span
                  style={{
                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: 600,
                  }}
                >
                  {selectedProjectForInvest.roi}%
                </span>
                <span
                  style={{
                    background: "#272c38",
                    color: "#f1f5f9",
                    padding: "4px 12px",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  %
                </span>
              </div>
            </div>

            {/* Action Button: Invest */}
            <button
              type="button"
              disabled={
                Boolean(investError) ||
                parsedAmount < selectedProjectForInvest.minimum ||
                isSubmittingInvest
              }
              onClick={handleConfirmInvestment}
              style={{
                width: "100%",
                height: "48px",
                borderRadius: "10px",
                background:
                  Boolean(investError) || parsedAmount < selectedProjectForInvest.minimum || isSubmittingInvest
                    ? "rgba(255, 255, 255, 0.1)"
                    : "#64748b",
                border: "none",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 600,
                cursor:
                  Boolean(investError) || parsedAmount < selectedProjectForInvest.minimum || isSubmittingInvest
                    ? "not-allowed"
                    : "pointer",
                marginTop: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.15s ease",
              }}
            >
              {isSubmittingInvest ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Invest</span>
              )}
            </button>
          </div>
        </div>
      )}

      <CustomConfirmModal
        state={confirmState}
        onClose={() => setConfirmState(null)}
      />
    </div>
  );
}
