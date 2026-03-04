"use client";

interface WizardStepsProps {
  currentStep: number;
}

const STEPS = [
  { number: 1, label: "Event" },
  { number: 2, label: "Menu" },
  { number: 3, label: "Staff" },
  { number: 4, label: "Celebrant" },
  { number: 5, label: "Preview" },
  { number: 6, label: "Payment" },
];

export default function WizardSteps({ currentStep }: WizardStepsProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <div key={step.number} className="flex flex-1 items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    isCompleted
                      ? "bg-eco text-white"
                      : isCurrent
                      ? "bg-eco text-white ring-4 ring-eco/20"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`mt-1.5 text-xs font-medium ${
                    isCompleted || isCurrent ? "text-eco" : "t-text-muted"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line (not after last step) */}
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-1 h-0.5 flex-1 transition-colors ${
                    step.number < currentStep ? "bg-eco" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
