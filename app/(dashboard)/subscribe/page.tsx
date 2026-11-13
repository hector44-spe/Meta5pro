"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Eye,
  EyeOff,
  CreditCard,
  ChevronDown,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import "@/styles/subscribe-page.css";

// ==========================================================================
// Types & Plan Definitions
// ==========================================================================

interface SubscriptionPlan {
  id: string;
  name: string;
  title: string;
  minimum: number;
  maximum: number;
  duration: number;
  roi: number;
  placeholder: number;
}

interface SubscriptionHistoryItem {
  ref: string;
  plan: string;
  duration: number;
  daysLeft: number;
  amount: number;
  roi: number;
  status: "open" | "completed";
  date: string;
}

const ORIGINAL_PLANS: SubscriptionPlan[] = [
  {
    id: "Starter1234",
    name: "Starter",
    title: "Starter plan",
    minimum: 11000,
    maximum: 19500,
    duration: 3,
    roi: 200,
    placeholder: 11000,
  },
  {
    id: "Lite1234",
    name: "Lite",
    title: "Lite plan",
    minimum: 20000,
    maximum: 49500,
    duration: 3,
    roi: 300,
    placeholder: 20000,
  },
  {
    id: "Classic1234",
    name: "Classic",
    title: "Classic plan",
    minimum: 50000,
    maximum: 99500,
    duration: 3,
    roi: 350,
    placeholder: 50000,
  },
  {
    id: "Pro1234",
    name: "Pro",
    title: "Pro plan",
    minimum: 100000,
    maximum: 1000000,
    duration: 3,
    roi: 403,
    placeholder: 100000,
  },
];

const SUBSCRIPTION_HOW_IT_WORKS = [
  {
    id: 1,
    title: "What is a subscription?",
    content:
      "A subscription plan allows you to invest capital into automated trading and algorithmic asset management strategies designed to generate high-yield returns over a specified duration with automated compounding.",
  },
  {
    id: 2,
    title: "Subscription balance",
    content:
      "Your subscription balance is dedicated solely to active subscriptions and package investments, separate from your main trading wallet to keep your capital allocations organized.",
  },
  {
    id: 3,
    title: "Fund balance",
    content:
      "You can fund your subscription balance directly using the Deposit button on this page, or transfer funds from your primary wallet balance at any time with instant credit.",
  },
  {
    id: 4,
    title: "How to subscribe",
    content:
      "Select any available plan (Starter, Lite, Classic, or Pro), enter your desired investment amount within the minimum and maximum range, and click Subscribe to begin your plan.",
  },
  {
    id: 5,
    title: "Duration",
    content:
      "Each subscription runs for the designated duration (e.g. 3 days). During this period, your capital is locked in the strategy until maturity to maximize target yield performance.",
  },
  {
    id: 6,
    title: "Make money",
    content:
      "Upon completion of the plan duration, your original capital plus the guaranteed Return on Investment (ROI) will be credited automatically to your account balance for withdrawal or reinvestment.",
  },
];

// Exact MetaGold Empty State Icon SVG
function EmptyStateIcon() {
  return (
    <svg
      className="svg-icon"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.132 6.06h10"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.352 2.5h5.56c1.78 0 2.22.44 2.22 2.2v4.11c0 1.76-.44 2.2-2.22 2.2h-5.56c-1.78 0-2.22-.44-2.22-2.2V4.7c0-1.76.44-2.2 2.22-2.2Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.132 17.56h10"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.352 14h5.56c1.78 0 2.22.44 2.22 2.2v4.11c0 1.76-.44 2.2-2.22 2.2h-5.56c-1.78 0-2.22-.44-2.22-2.2V16.2c0-1.76.44-2.2 2.22-2.2ZM22.132 15.5c0 3.87-3.13 7-7 7l1.05-1.75"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.05 4.1 3.738 7.414M3.732 4.1l3.314 3.314"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ==========================================================================
// Subscribe Page Component
// ==========================================================================

export default function SubscribePage() {
  const { currentBalance, hideBalance, setHideBalance, openModal } = useDashboard();

  // Subscription Balance (initialized to $0.00 by default like the original, or user's balance)
  const [subscriptionBalance, setSubscriptionBalance] = useState<number>(0);

  // Active Subscription Plan Name (starts as "-" if none, or plan name)
  const [activePlan, setActivePlan] = useState<string | null>(null);

  // Subscription History items list
  const [historyList, setHistoryList] = useState<SubscriptionHistoryItem[]>([]);

  // Tab Switching State
  const [activeTab, setActiveTab] = useState<"plans" | "history" | "how_it_works">("plans");
  const [tabIndicatorStyle, setTabIndicatorStyle] = useState({
    left: "0px",
    width: "35px",
  });

  const plansTabRef = useRef<HTMLButtonElement>(null);
  const historyTabRef = useRef<HTMLButtonElement>(null);
  const howItWorksTabRef = useRef<HTMLButtonElement>(null);

  // Update animated indicator position
  useEffect(() => {
    if (activeTab === "plans" && plansTabRef.current) {
      setTabIndicatorStyle({
        left: `${plansTabRef.current.offsetLeft}px`,
        width: `${plansTabRef.current.offsetWidth}px`,
      });
    } else if (activeTab === "history" && historyTabRef.current) {
      setTabIndicatorStyle({
        left: `${historyTabRef.current.offsetLeft}px`,
        width: `${historyTabRef.current.offsetWidth}px`,
      });
    } else if (activeTab === "how_it_works" && howItWorksTabRef.current) {
      setTabIndicatorStyle({
        left: `${howItWorksTabRef.current.offsetLeft}px`,
        width: `${howItWorksTabRef.current.offsetWidth}px`,
      });
    }
  }, [activeTab]);

  // Form Inputs & Error State per Card
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submittingPlanId, setSubmittingPlanId] = useState<string | null>(null);

  // Success Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Accordion open item for "How it works"
  const [openQuestionId, setOpenQuestionId] = useState<number | null>(null);

  // Currency Formatter
  const formatCurrency = useCallback((val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  }, []);

  // Validation function matching exact original messages
  const validateAmount = (plan: SubscriptionPlan, rawVal: string): string | null => {
    if (!rawVal || rawVal.trim() === "") return null;
    const num = parseFloat(rawVal);
    if (isNaN(num)) return "Please enter a valid amount";
    if (num > subscriptionBalance) {
      return `Amount exceeds current balance of ${formatCurrency(subscriptionBalance)}`;
    }
    if (num > plan.maximum) {
      return `Maximum plan amount is ${formatCurrency(plan.maximum)}`;
    }
    if (num < plan.minimum) {
      return `Minimum plan amount is ${formatCurrency(plan.minimum)}`;
    }
    return null;
  };

  // Handle Input Change
  const handleInputChange = (plan: SubscriptionPlan, val: string) => {
    setInputs((prev) => ({ ...prev, [plan.id]: val }));
    const err = validateAmount(plan, val);
    setErrors((prev) => ({ ...prev, [plan.id]: err }));
  };

  // Handle Subscribe Submission
  const handleSubscribe = async (plan: SubscriptionPlan) => {
    const val = inputs[plan.id];
    const err = validateAmount(plan, val);

    if (err) {
      setErrors((prev) => ({ ...prev, [plan.id]: err }));
      return;
    }

    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) return;

    setSubmittingPlanId(plan.id);

    setTimeout(() => {
      // Deduct from subscription balance
      setSubscriptionBalance((prev) => Math.max(0, prev - num));

      // Set active subscription
      setActivePlan(`${plan.name} plan`);

      // Add to history
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const newRef = `sub${randomSuffix}`;
      const newHistoryItem: SubscriptionHistoryItem = {
        ref: newRef,
        plan: plan.name,
        duration: plan.duration,
        daysLeft: plan.duration,
        amount: num,
        roi: plan.roi,
        status: "open",
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };

      setHistoryList((prev) => [newHistoryItem, ...prev]);
      setSubmittingPlanId(null);
      setInputs((prev) => ({ ...prev, [plan.id]: "" }));

      // Show toast
      setToastMessage(`You subscribed to ${plan.name} plan successfully`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 1000);
  };

  return (
    <div className="subscribe-page-wrapper">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="subscribe-toast-banner">
          <CheckCircle2 size={18} />
          <p>{toastMessage}</p>
        </div>
      )}
      {/* Main Content Card */}
      <div className="subscribe-content-card scrollbar-hide">
        {/* Top Subscription Balance Card */}
        <div className="subscription_top">
          <div>
            <div className="subscription-balance-box">
              <div>
                <span className="balance_label_wrapper">
                  <p className="balance_label">Subscription balance</p>
                  <button
                    className="eyes_button"
                    onClick={() => setHideBalance((prev) => !prev)}
                    title={hideBalance ? "Show balance" : "Hide balance"}
                    aria-label="Toggle subscription balance visibility"
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
                  <span className="user_balance">
                    {formatCurrency(subscriptionBalance)}
                  </span>
                )}
              </div>

              {/* Deposit Button */}
              <button
                className="subscription-deposit-btn"
                onClick={() => openModal("deposit")}
              >
                <CreditCard size={16} strokeWidth={2} />
                <p>Deposit</p>
              </button>
            </div>
          </div>

          {/* Current Subscription Indicator */}
          <p className="subscription_current">
            Your current subscription is:{" "}
            <strong className={activePlan ? "active-plan-badge" : ""}>
              {activePlan || "-"}
            </strong>
          </p>
        </div>

        {/* Bottom Section: Tabs & View */}
        <div className="subscription_bottom">
          {/* Switcher Navigation */}
          <div className="subscription-switcher">
            <div className="switcher_wrapper_inner">
              <button
                ref={plansTabRef}
                className={`switcher_item ${activeTab === "plans" ? "active" : ""}`}
                onClick={() => setActiveTab("plans")}
              >
                Plans
              </button>
              <button
                ref={historyTabRef}
                className={`switcher_item ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                Your history
              </button>
              <button
                ref={howItWorksTabRef}
                className={`switcher_item ${activeTab === "how_it_works" ? "active" : ""}`}
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

          {/* ===================== TAB 1: PLANS ===================== */}
          {activeTab === "plans" && (
            <div className="subscription_plans_view">
              <div className="subscription_plans_header">
                <p>Plans</p>
              </div>

              <div className="subscription-cards-grid">
                {ORIGINAL_PLANS.map((plan) => {
                  const currentVal = inputs[plan.id] || "";
                  const errorMsg = errors[plan.id];
                  const isSubmitting = submittingPlanId === plan.id;
                  const isBtnDisabled =
                    isSubmitting ||
                    !currentVal ||
                    currentVal.trim() === "" ||
                    Boolean(errorMsg);

                  return (
                    <div key={plan.id} className="subscribe_card">
                      {/* Card Top Title */}
                      <div className="subscribe_card_top">
                        <p className="subscribe_title">{plan.title}</p>
                      </div>

                      {/* Card Details */}
                      <div className="subscribe_card_details">
                        <span className="subscribe_card_detail">
                          <p>Minimum</p>
                          <p>{formatCurrency(plan.minimum)}</p>
                        </span>
                        <span className="subscribe_card_detail">
                          <p>Maximum</p>
                          <p>{formatCurrency(plan.maximum)}</p>
                        </span>
                        <span className="subscribe_card_detail">
                          <p>Plan duration</p>
                          <p>{plan.duration} days</p>
                        </span>
                        <span className="subscribe_card_detail">
                          <p>Roi</p>
                          <p className="roi">{plan.roi}%</p>
                        </span>
                      </div>

                      {/* Card Amount Input Box */}
                      <div className="subscribe_card_amount">
                        <div
                          className={`amountbox_primary ${errorMsg ? "error" : ""}`}
                        >
                          <label>Amount</label>
                          <div className="amountbox_wrapper">
                            <input
                              type="number"
                              placeholder={plan.placeholder.toString()}
                              value={currentVal}
                              onChange={(e) =>
                                handleInputChange(plan, e.target.value)
                              }
                            />
                            <span className="amount_select">
                              <p>USD</p>
                            </span>
                          </div>

                          <div className="captions">
                            {errorMsg && (
                              <p className="caption error">{errorMsg}</p>
                            )}
                            <span className="caption">
                              <p>Current balance</p>
                              <p>{formatCurrency(subscriptionBalance)}</p>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Subscribe Button */}
                      <div className="subscribe_card_footer">
                        <button
                          disabled={isBtnDisabled}
                          className={`subscribe-submit-btn ${
                            isBtnDisabled ? "disabled" : ""
                          }`}
                          onClick={() => handleSubscribe(plan)}
                        >
                          {isSubmitting ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                              color="#ffffff"
                            />
                          ) : (
                            <p>Subscribe</p>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================== TAB 2: YOUR HISTORY ===================== */}
          {activeTab === "history" && (
            <div className="subscription_history_view">
              <div className="subscription_history_header">
                <p>Your history</p>
              </div>

              {historyList.length === 0 ? (
                <div className="subscribe-empty-state">
                  <EmptyStateIcon />
                  <p>No subscriptions yet</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="subscription-desktop-table-wrapper">
                    <div className="table_wrapper">
                      <table className="subscription-history-table">
                        <thead>
                          <tr>
                            <th className="col-ref">Reference</th>
                            <th className="col-plan">Plan</th>
                            <th className="col-duration">Duration</th>
                            <th className="col-amount">Amount</th>
                            <th className="col-roi">Roi</th>
                            <th className="col-status">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyList.map((item) => (
                            <tr key={item.ref}>
                              <td className="col-ref">
                                <p title={item.ref}>{item.ref}</p>
                              </td>
                              <td className="col-plan">
                                <p>{item.plan}</p>
                              </td>
                              <td className="col-duration">
                                <div className="duration-label-wrapper">
                                  <p>
                                    {item.duration}{" "}
                                    {item.duration > 1 ? "days" : "day"}
                                  </p>
                                  <strong className="history-days-badge">
                                    {item.daysLeft}d left
                                  </strong>
                                </div>
                              </td>
                              <td className="col-amount">
                                <p>{formatCurrency(item.amount)}</p>
                              </td>
                              <td className="col-roi">
                                <p>{item.roi}%</p>
                              </td>
                              <td className="col-status">
                                <span className="status-badge-approved">
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile History Cards View */}
                  <div className="subscription-mobile-history-wrapper">
                    <div className="subscribe_content_wrapper scrollbar-hide">
                      {historyList.map((item) => (
                        <div key={item.ref} className="subscribe_history_item">
                          <div className="left">
                            <span className="left_info">
                              <span className="left_info_title">
                                {item.ref}
                                <strong className="history-days-badge">
                                  {item.daysLeft}d left
                                </strong>
                              </span>
                              <p className="left_info_value">{item.plan} plan</p>
                            </span>
                          </div>
                          <div className="right">
                            <span className="right_info">
                              <p className="title">Amount:</p>
                              <p className="value">
                                {formatCurrency(item.amount)}
                              </p>
                            </span>
                            <span className="right_info">
                              <p className="title">Roi:</p>
                              <p className="roi-value">{item.roi}%</p>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ===================== TAB 3: HOW IT WORKS ===================== */}
          {activeTab === "how_it_works" && (
            <div className="how_it_works_view">
              <div className="how_it_works_header">
                <p>How it works</p>
              </div>

              <div className="how_it_works_content">
                <div className="questions_wrapper">
                  {SUBSCRIPTION_HOW_IT_WORKS.map((q) => {
                    const isOpen = openQuestionId === q.id;
                    return (
                      <div
                        key={q.id}
                        className={`question ${isOpen ? "open" : ""}`}
                        onClick={() =>
                          setOpenQuestionId(isOpen ? null : q.id)
                        }
                      >
                        <div className="wrapper">
                          <div className="left_section">
                            <div className="question_number">
                              <p>{q.id}</p>
                            </div>
                            <p className="question_title">{q.title}</p>
                          </div>
                          <ChevronDown
                            size={15}
                            strokeWidth={1.5}
                            className="question_chevron"
                          />
                        </div>
                        {isOpen && (
                          <div className="question_answer_wrapper">
                            <p className="question_answer">{q.content}</p>
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
    </div>
  );
}
