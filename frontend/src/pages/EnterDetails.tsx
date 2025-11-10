import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import useAuthStore from "../utils/authStore";
import useFinancialDataStore from "../utils/financialDataStore";
import {
  personalInfoSchema,
  // assetsLiabilitiesSchema, // Remove old combined schema
  assetsSchema, // New
  liabilitiesSchema, // New
  goalsSchema,
  riskAppetiteSchema,
  PersonalInfoValues,
  // AssetsLiabilitiesValues, // Remove old combined type
  AssetsValues, // New
  LiabilitiesValues, // New
  GoalsValues,
  RiskAppetiteValues,
  FinancialDataValues, // Combined type for store/API
} from "../utils/formSchema"; // Correct path
import { z } from "zod";
// Import shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import DisclaimerAlert from "../components/DisclaimerAlert";
import PrivacyPolicyModal from "../components/PrivacyPolicyModal";
import GuidelineBox from "../components/GuidelineBox";
import { illiquidAssetDescriptions, liquidAssetDescriptions, liabilityDescriptions } from "../utils/assetDescriptions";
// Assuming Tabs are used for layout, keep if already present or add if needed
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define default structures matching schemas
const defaultAssets: AssetsValues = {
  illiquid: {
    home: 0,
    other_real_estate: 0,
    jewellery: 0,
    sgb: 0,
    ulips: 0,
    epf_ppf_vpf: 0,
  },
  liquid: {
    fixed_deposit: 0,
    debt_funds: 0,
    domestic_stock_market: 0,
    domestic_equity_mutual_funds: 0,
    cash_from_equity_mutual_funds: 0,
    us_equity: 0,
    liquid_savings_cash: 0,
    gold_etf_digital_gold: 0,
    crypto: 0,
    reits: 0,
  },
};

const defaultLiabilities: LiabilitiesValues = {
  home_loan: 0,
  education_loan: 0,
  car_loan: 0,
  personal_gold_loan: 0,
  credit_card: 0,
  other_liabilities: 0,
};

export default function EnterDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Get store functions and state
  const { user } = useAuthStore(); // Get the authenticated user
  const { fetchFinancialData, saveFinancialData, financialData, isLoading, error } =
    useFinancialDataStore();

  // Initialize separate forms for each logical section using updated schemas
  const personalInfoForm = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: { // Provide explicit defaults
      name: "",
      age: 30,
      monthlySalary: 0,
      monthlyExpenses: 0,
    },
  });

  const assetsForm = useForm<AssetsValues>({
    resolver: zodResolver(assetsSchema),
    defaultValues: defaultAssets, // Use defined default structure
  });

  const liabilitiesForm = useForm<LiabilitiesValues>({
    resolver: zodResolver(liabilitiesSchema),
    defaultValues: defaultLiabilities, // Use defined default structure
  });

  const goalsForm = useForm<GoalsValues>({
    resolver: zodResolver(goalsSchema),
    defaultValues: { // Keep existing goal defaults
      shortTermGoals: [{ name: "", amount: 0, years: 1 }],
      midTermGoals: [{ name: "", amount: 0, years: 5 }],
      longTermGoals: [{ name: "", amount: 0, years: 10 }],
    },
  });

  const riskAppetiteForm = useForm<RiskAppetiteValues>({
    resolver: zodResolver(riskAppetiteSchema),
    defaultValues: { // Use defaults from updated schema
      risk_tolerance: 3,
      inflationRate: 5,
      retirementAge: 55,
      // riskQuestion1 and riskQuestion2 removed as per schema update
    },
  });

  // Set up field arrays for dynamic goal fields
  const { fields: shortTermFields, append: appendShortTerm, remove: removeShortTerm } = 
    useFieldArray({
      control: goalsForm.control,
      name: "shortTermGoals",
    });

  const { fields: midTermFields, append: appendMidTerm, remove: removeMidTerm } = 
    useFieldArray({
      control: goalsForm.control,
      name: "midTermGoals",
    });

  const { fields: longTermFields, append: appendLongTerm, remove: removeLongTerm } = 
    useFieldArray({
      control: goalsForm.control,
      name: "longTermGoals",
    });

  // Load saved financial data when component mounts
  useEffect(() => {
    console.log("EnterDetails: Effective user object:", JSON.stringify(user, null, 2));
    const loadSavedData = async () => {
      if (user?.id) { // Only fetch if user.id is available
        try {
          console.log(`EnterDetails: Loading saved data for user: ${user.id}`);
          await fetchFinancialData(user.id);
          setIsInitialDataLoaded(true);
        } catch (error) {
          console.error(`Error loading saved data for user ${user.id}:`, error);
          setIsInitialDataLoaded(true); // Still allow form to be used even if load fails
        }
      } else {
        console.log("EnterDetails: No user.id available, not fetching initial data.");
        setIsInitialDataLoaded(true); // Mark as loaded to prevent re-attempts before user.id is set
        // Reset forms to default if no user or user changes, to avoid stale data
        personalInfoForm.reset();
        assetsForm.reset();
        liabilitiesForm.reset();
        goalsForm.reset();
        riskAppetiteForm.reset();
      }
    };

    loadSavedData();
  }, [user?.id, fetchFinancialData]); // Add user.id and fetchFinancialData to dependency array

  // Update form values when financial data is loaded or changes
  useEffect(() => {
    // Only update forms if we have data and initial loading is complete
    if (financialData && isInitialDataLoaded) {
      console.log("Resetting forms with loaded data:", financialData);

      // Reset each form with corresponding part of the data, providing defaults if missing
      personalInfoForm.reset(financialData.personalInfo || { name: "", age: 30, monthlySalary: 0, monthlyExpenses: 0 });
      assetsForm.reset(financialData.assets || defaultAssets);
      liabilitiesForm.reset(financialData.liabilities || defaultLiabilities);
      // Ensure goals reset handles potential undefined arrays gracefully
      goalsForm.reset({
          shortTermGoals: financialData.goals?.shortTermGoals || [{ name: "", amount: 0, years: 1 }],
          midTermGoals: financialData.goals?.midTermGoals || [{ name: "", amount: 0, years: 5 }],
          longTermGoals: financialData.goals?.longTermGoals || [{ name: "", amount: 0, years: 10 }],
      });
      riskAppetiteForm.reset(financialData.riskAppetite || { risk_tolerance: 3, inflationRate: 5, retirementAge: 55 });

    } else if (isInitialDataLoaded) {
      // If no data loaded, ensure forms are set to their initial default values
      console.log("No saved data found or already reset, ensuring default values.");
      personalInfoForm.reset(); // Resets to defaultValues defined in useForm
      assetsForm.reset();
      liabilitiesForm.reset();
      goalsForm.reset();
      riskAppetiteForm.reset();
    }
    // Dependency array includes financialData and loaded flag, plus form instances
  }, [financialData, isInitialDataLoaded, personalInfoForm, assetsForm, liabilitiesForm, goalsForm, riskAppetiteForm]);

// Save current tab's data (validate only)
  const saveCurrentTabData = async (tabIndex: number) => {
    console.log(`Attempting to validate tab ${tabIndex}`);
    let isValid = false;
    try {
      switch (tabIndex) {
        case 0: // Personal Info
          isValid = await personalInfoForm.trigger();
          break;
        case 1: // Assets (New Tab Index)
          isValid = await assetsForm.trigger();
          break;
        case 2: // Liabilities (New Tab Index)
          isValid = await liabilitiesForm.trigger();
          break;
        case 3: // Goals (New Tab Index)
          isValid = await goalsForm.trigger();
          break;
        case 4: // Risk Appetite (New Tab Index)
          isValid = await riskAppetiteForm.trigger();
          break;
        default:
          isValid = true; // Should not happen
      }
      if (!isValid) {
        console.error(`Validation failed for tab ${tabIndex}`);
        toast.error("Please fix the errors on the current tab.");
      }
    } catch (error) {
      console.error(`Error triggering validation for tab ${tabIndex}:`, error);
      toast.error("An unexpected error occurred during validation.");
      isValid = false;
    }
    return isValid;
  };

  const handleTabClick = async (index: number) => {
    const isValid = await saveCurrentTabData(activeTab); // Validate current before switching
    if (isValid) {
      setActiveTab(index);
    }
  };

  const handleNext = async () => {
    const isValid = await saveCurrentTabData(activeTab);
    if (isValid) {
      if (activeTab < tabs.length - 1) {
        setActiveTab(activeTab + 1);
      } else {
        // On last tab, trigger submit
        await handleSubmit();
      }
    }
  };

  const handlePrevious = async () => {
    // No validation needed when going back, just switch tab
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

 const handleStartOver = () => {
    if (window.confirm("Are you sure you want to start over? All unsaved data will be lost.")) {
      personalInfoForm.reset(); // Resets to defaultValues defined in useForm
      assetsForm.reset();
      liabilitiesForm.reset();
      goalsForm.reset();
      riskAppetiteForm.reset();
      setActiveTab(0);
      toast.success("Form has been reset.");
      // Optionally clear data in the store/backend
      // Consider adding a `clearFinancialData` action to the store
    }
  };

 const handleSubmit = async () => {
    setIsSubmitting(true);
    // Clear previous global error state if using store for it
    // useFinancialDataStore.setState({ error: null });
    console.log("Initiating final form submission...");

    // Trigger validation for all forms concurrently
    const validationResults = await Promise.all([
      personalInfoForm.trigger(),
      assetsForm.trigger(),
      liabilitiesForm.trigger(),
      goalsForm.trigger(),
      riskAppetiteForm.trigger(),
    ]);

    const allFormsValid = validationResults.every(isValid => isValid);

    if (allFormsValid) {
      console.log("All forms validated successfully. Compiling data...");
      if (!user?.id) {
        toast.error("User not authenticated. Please log in to save data.");
        setIsSubmitting(false);
        return;
      }

      const assetsData = assetsForm.getValues();
      const liabilitiesData = liabilitiesForm.getValues();
      
      // Data for API should now include the detailed assets and liabilities objects
      const dataForApi = {
        personalInfo: personalInfoForm.getValues(),
        assets: assetsData, // Send the full detailed assets object
        liabilities: liabilitiesData, // Send the full detailed liabilities object
        goals: goalsForm.getValues(),
        riskAppetite: riskAppetiteForm.getValues(), // This includes risk_tolerance, inflationRate, retirementAge
        userId: user.id, // Use the actual authenticated user's ID
      };

      console.log("Data prepared for API:", JSON.stringify(dataForApi, null, 2));

      try {
        console.log("Calling saveFinancialData from store with transformed data...");
        // Pass the correctly structured data to the store action
        // The store action expects FinancialDataValues, which allows for optional assets/liabilities
        // and a defined assetsLiabilities field. Our dataForApi matches this.
        const success = await saveFinancialData(dataForApi as FinancialDataValues);

        if (success) {
          console.log("Data saved successfully via store.");
          toast.success("Your financial data has been saved!");
          navigate("/NetWorth"); // Navigate to Net Worth page after successful save
        } else {
            // Error handled by store, but log just in case
            console.error("saveFinancialData store action returned false or threw error handled by store.");
            // Toast error likely shown by store's error handling
        }
      } catch (err) {
          // Catch errors not handled by the store action itself
          console.error("Unexpected error during handleSubmit saveFinancialData call:", err);
          toast.error(`An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } else {
      console.error("Form validation failed. Errors:", {
        personalInfo: personalInfoForm.formState.errors,
        assets: assetsForm.formState.errors,
        liabilities: liabilitiesForm.formState.errors,
        goals: goalsForm.formState.errors,
        riskAppetite: riskAppetiteForm.formState.errors,
      });
      toast.error("Please correct the errors in the form before submitting.");
    }

    setIsSubmitting(false);
  };



  // Define the tabs (Updated)
  const tabs = [
    { name: "Personal Info", description: "Basic information and monthly finances", index: 0 },
    { name: "Assets", description: "Your investments and owned items", index: 1 },
    { name: "Liabilities", description: "Your outstanding loans and debts", index: 2 },
    { name: "Goals", description: "Short, mid and long-term financial goals", index: 3 },
    { name: "Risk Appetite", description: "Your investment risk tolerance", index: 4 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 py-6 px-8">
            <h1 className="text-2xl font-bold text-white">Enter Your Financial Details</h1>
            <p className="text-blue-100 mt-1">
              Let's gather your information to build your personalized financial plan
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="px-8 pt-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => handleTabClick(index)}
                    className={`${activeTab === index
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    <div className="flex items-center">
                      <div className={`${activeTab >= index ? 'bg-blue-500' : 'bg-gray-200'} text-white rounded-full h-5 w-5 flex items-center justify-center mr-2`}>
                        {index + 1}
                      </div>
                      {tab.name}
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h2>
                <p className="text-gray-600 mb-6">{tabs[activeTab].description}</p>

                {/* Financial Advice Disclaimer */}
                <DisclaimerAlert type="warning" title="⚠️ Important Financial Disclaimer">
                  <p>
                    The personal financial health check-up is provided for <strong>general information and
                    educational purposes only</strong>. It is <strong>not intended to be financial advice</strong>.
                    You should consult with a qualified financial expert for advice tailored to your specific situation.
                  </p>
                </DisclaimerAlert>

                {/* Personal Info Form Fields - Will be implemented with React Hook Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Your full name"
                      {...personalInfoForm.register("name")}
                    />
                    {personalInfoForm.formState.errors.name && (
                      <p className="mt-1 text-sm text-red-600">{personalInfoForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Your age"
                      {...personalInfoForm.register("age")}
                    />
                    {personalInfoForm.formState.errors.age && (
                      <p className="mt-1 text-sm text-red-600">{personalInfoForm.formState.errors.age.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Salary</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="0.00"
                        {...personalInfoForm.register("monthlySalary")}
                      />
                    </div>
                    {personalInfoForm.formState.errors.monthlySalary && (
                      <p className="mt-1 text-sm text-red-600">{personalInfoForm.formState.errors.monthlySalary.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Expenses</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="0.00"
                        {...personalInfoForm.register("monthlyExpenses")}
                      />
                    </div>
                    {personalInfoForm.formState.errors.monthlyExpenses && (
                      <p className="mt-1 text-sm text-red-600">{personalInfoForm.formState.errors.monthlyExpenses.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-4">{tabs[activeTab].name}</h2>
                <p className="text-gray-600 mb-6">{tabs[activeTab].description}</p>

                {/* Guideline Box */}
                <GuidelineBox />

                <div className="space-y-8">
                  {/* Illiquid Assets */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-md font-medium text-gray-700">Illiquid Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(Object.keys(defaultAssets.illiquid) as Array<keyof AssetsValues['illiquid']>).map((key) => {
                        const assetInfo = illiquidAssetDescriptions[key];
                        return (
                          <div key={`illiquid-${key}`}>
                            <div className="flex items-center gap-1 mb-1">
                              <Label htmlFor={`illiquid-${key}`} className="text-sm font-medium text-gray-700">
                                {assetInfo?.label || key.replace(/_/g, ' ')}
                              </Label>
                              {assetInfo && (
                                <TooltipProvider>
                                  <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs p-3 bg-gray-800 text-white rounded-md shadow-lg">
                                      <p className="font-semibold mb-1">{assetInfo.label}</p>
                                      <p className="text-sm mb-2">{assetInfo.description}</p>
                                      {assetInfo.example && (
                                        <p className="text-xs text-gray-300 italic">Example: {assetInfo.example}</p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">₹</span>
                              </div>
                              <Input
                                id={`illiquid-${key}`}
                                type="number"
                                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="0.00"
                                {...assetsForm.register(`illiquid.${key}`, { valueAsNumber: true })}
                              />
                            </div>
                            {assetsForm.formState.errors.illiquid?.[key] && (
                              <p className="mt-1 text-sm text-red-600">{assetsForm.formState.errors.illiquid[key]?.message}</p>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {/* Liquid Assets */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-md font-medium text-gray-700">Liquid Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(Object.keys(defaultAssets.liquid) as Array<keyof AssetsValues['liquid']>).map((key) => {
                        const assetInfo = liquidAssetDescriptions[key];
                        return (
                          <div key={`liquid-${key}`}>
                            <div className="flex items-center gap-1 mb-1">
                              <Label htmlFor={`liquid-${key}`} className="text-sm font-medium text-gray-700">
                                {assetInfo?.label || key.replace(/_/g, ' ')}
                              </Label>
                              {assetInfo && (
                                <TooltipProvider>
                                  <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs p-3 bg-gray-800 text-white rounded-md shadow-lg">
                                      <p className="font-semibold mb-1">{assetInfo.label}</p>
                                      <p className="text-sm mb-2">{assetInfo.description}</p>
                                      {assetInfo.example && (
                                        <p className="text-xs text-gray-300 italic">Example: {assetInfo.example}</p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">₹</span>
                              </div>
                              <Input
                                id={`liquid-${key}`}
                                type="number"
                                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="0.00"
                                {...assetsForm.register(`liquid.${key}`, { valueAsNumber: true })}
                              />
                            </div>
                            {assetsForm.formState.errors.liquid?.[key] && (
                              <p className="mt-1 text-sm text-red-600">{assetsForm.formState.errors.liquid[key]?.message}</p>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-4">{tabs[activeTab].name}</h2>
                <p className="text-gray-600 mb-6">{tabs[activeTab].description}</p>

                {/* Guideline Box */}
                <GuidelineBox />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-md font-medium text-gray-700">Liabilities</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(Object.keys(defaultLiabilities) as Array<keyof LiabilitiesValues>).map((key) => {
                      const liabilityInfo = liabilityDescriptions[key];
                      return (
                        <div key={`liability-${key}`}>
                          <div className="flex items-center gap-1 mb-1">
                            <Label htmlFor={`liability-${key}`} className="text-sm font-medium text-gray-700">
                              {liabilityInfo?.label || key.replace(/_/g, ' ')}
                            </Label>
                            {liabilityInfo && (
                              <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs p-3 bg-gray-800 text-white rounded-md shadow-lg">
                                    <p className="font-semibold mb-1">{liabilityInfo.label}</p>
                                    <p className="text-sm mb-2">{liabilityInfo.description}</p>
                                    {liabilityInfo.example && (
                                      <p className="text-xs text-gray-300 italic">Example: {liabilityInfo.example}</p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">₹</span>
                            </div>
                            <Input
                              id={`liability-${key}`}
                              type="number"
                              className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              placeholder="0.00"
                              {...liabilitiesForm.register(key, { valueAsNumber: true })}
                            />
                          </div>
                          {liabilitiesForm.formState.errors[key] && (
                            <p className="mt-1 text-sm text-red-600">{liabilitiesForm.formState.errors[key]?.message}</p>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 3 && (
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-4">{tabs[activeTab].name}</h2>
                <p className="text-gray-600 mb-6">{tabs[activeTab].description}</p>

                {/* Guideline Box */}
                <GuidelineBox />

                {/* Goals Form Fields */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-4">Short-Term Goals (0-3 years)</h3>
                    {shortTermFields.map((field, index) => (
                      <div key={field.id} className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Goal Name</label>
                            <input
                              type="text"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              placeholder="e.g., Emergency Fund"
                              {...goalsForm.register(`shortTermGoals.${index}.name`)}
                            />
                            {goalsForm.formState.errors.shortTermGoals?.[index]?.name && (
                              <p className="mt-1 text-sm text-red-600">{goalsForm.formState.errors.shortTermGoals[index].name.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Target Amount</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">₹</span>
                              </div>
                              <input
                                type="number"
                                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="0.00"
                                {...goalsForm.register(`shortTermGoals.${index}.amount`)}
                              />
                            </div>
                            {goalsForm.formState.errors.shortTermGoals?.[index]?.amount && (
                              <p className="mt-1 text-sm text-red-600">{goalsForm.formState.errors.shortTermGoals[index].amount.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Deadline (Years)</label>
                            <input
                              type="number"
                              min="0"
                              max="3"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              placeholder="1-3 years"
                              {...goalsForm.register(`shortTermGoals.${index}.years`)}
                            />
                            {goalsForm.formState.errors.shortTermGoals?.[index]?.years && (
                              <p className="mt-1 text-sm text-red-600">{goalsForm.formState.errors.shortTermGoals[index].years.message}</p>
                            )}
                          </div>
                        </div>
                        {index > 0 && (
                          <button 
                            type="button"
                            onClick={() => removeShortTerm(index)}
                            className="mt-2 text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => appendShortTerm({ name: "", amount: 0, years: 1 })}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add another short-term goal
                    </button>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-4">Mid-Term Goals (3-7 years)</h3>
                    {midTermFields.map((field, index) => (
                      <div key={field.id} className="bg-green-50 p-4 rounded-md border border-green-100 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Goal Name</label>
                            <input
                              type="text"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              placeholder="e.g., Home Down Payment"
                              {...goalsForm.register(`midTermGoals.${index}.name`)}
                            />
                            {goalsForm.formState.errors.midTermGoals?.[index]?.name && (
                              <p className="mt-1 text-sm text-red-600">{goalsForm.formState.errors.midTermGoals[index].name.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Target Amount</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">₹</span>
                              </div>
                              <input
                                type="number"
                                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="0.00"
                                {...goalsForm.register(`midTermGoals.${index}.amount`)}
                              />
                            </div>
                            {goalsForm.formState.errors.midTermGoals?.[index]?.amount && (
                              <p className="mt-1 text-sm text-red-600">{goalsForm.formState.errors.midTermGoals[index].amount.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Deadline (Years)</label>
                            <input
                              type="number"
                              min="3"
                              max="7"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              placeholder="3-7 years"
                              {...goalsForm.register(`midTermGoals.${index}.years`)}
                            />
                            {goalsForm.formState.errors.midTermGoals?.[index]?.years && (
                              <p className="mt-1 text-sm text-red-600">{goalsForm.formState.errors.midTermGoals[index].years.message}</p>
                            )}
                          </div>
                        </div>
                        {index > 0 && (
                          <button 
                            type="button"
                            onClick={() => removeMidTerm(index)}
                            className="mt-2 text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => appendMidTerm({ name: "", amount: 0, years: 5 })}
                      className="mt-2 text-sm text-green-600 hover:text-green-800"
                    >
                      + Add another mid-term goal
                    </button>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-4">Long-Term Goals (7+ years)</h3>
                    {longTermFields.map((field, index) => (
                      <div key={field.id} className="bg-teal-50 p-4 rounded-md border border-teal-100 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Goal Name</label>
                            <input
                              type="text"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              placeholder="e.g., Retirement"
                              {...goalsForm.register(`longTermGoals.${index}.name`)}
                            />
                            {goalsForm.formState.errors.longTermGoals?.[index]?.name && (
                              <p className="mt-1 text-sm text-red-600">{goalsForm.formState.errors.longTermGoals[index].name.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Target Amount</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">₹</span>
                              </div>
                              <input
                                type="number"
                                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="0.00"
                                {...goalsForm.register(`longTermGoals.${index}.amount`)}
                              />
                            </div>
                            {goalsForm.formState.errors.longTermGoals?.[index]?.amount && (
                              <p className="mt-1 text-sm text-red-600">{goalsForm.formState.errors.longTermGoals[index].amount.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Deadline (Years)</label>
                            <input
                              type="number"
                              min="7"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              placeholder="7+ years"
                              {...goalsForm.register(`longTermGoals.${index}.years`)}
                            />
                            {goalsForm.formState.errors.longTermGoals?.[index]?.years && (
                              <p className="mt-1 text-sm text-red-600">{goalsForm.formState.errors.longTermGoals[index].years.message}</p>
                            )}
                          </div>
                        </div>
                        {index > 0 && (
                          <button 
                            type="button"
                            onClick={() => removeLongTerm(index)}
                            className="mt-2 text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => appendLongTerm({ name: "", amount: 0, years: 10 })}
                      className="mt-2 text-sm text-teal-600 hover:text-teal-800"
                    >
                      + Add another long-term goal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 4 && (
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-4">{tabs[activeTab].name}</h2>
                <p className="text-gray-600 mb-6">{tabs[activeTab].description}</p>

                {/* Risk Appetite Form Fields */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-3">
                      Investment Risk Tolerance
                    </label>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full" 
                        style={{ width: `${(Number(riskAppetiteForm.watch("riskTolerance") || 3) / 5) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 px-1">
                      <span>Very Conservative</span>
                      <span>Conservative</span>
                      <span>Moderate</span>
                      <span>Aggressive</span>
                      <span>Very Aggressive</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      defaultValue="3"
                      className="w-full h-2 bg-transparent focus:outline-none focus:ring-0 appearance-none mt-6"
                      {...riskAppetiteForm.register("riskTolerance")}
                    />
                    {riskAppetiteForm.formState.errors.riskTolerance && (
                      <p className="mt-1 text-sm text-red-600">{riskAppetiteForm.formState.errors.riskTolerance.message}</p>
                    )}
                  </div>

                  <div className="mt-8">
                    <h3 className="text-md font-medium text-gray-700 mb-3">Risk Profile Assessment</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-700 mb-2">How would you react if your investments lost 20% of their value in a single year?</p>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              id="risk-q1-a"
                              name="riskQuestion1"
                              type="radio"
                              value="sell_all"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              {...riskAppetiteForm.register("riskQuestion1")}
                            />
                            <label htmlFor="risk-q1-a" className="ml-3 block text-sm text-gray-700">
                              I would sell all my investments immediately
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="risk-q1-b"
                              name="riskQuestion1"
                              type="radio"
                              value="sell_some"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              {...riskAppetiteForm.register("riskQuestion1")}
                            />
                            <label htmlFor="risk-q1-b" className="ml-3 block text-sm text-gray-700">
                              I would sell some of my investments
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="risk-q1-c"
                              name="riskQuestion1"
                              type="radio"
                              value="hold"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              {...riskAppetiteForm.register("riskQuestion1")}
                            />
                            <label htmlFor="risk-q1-c" className="ml-3 block text-sm text-gray-700">
                              I would hold onto my investments and wait for recovery
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="risk-q1-d"
                              name="riskQuestion1"
                              type="radio"
                              value="buy_more"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              {...riskAppetiteForm.register("riskQuestion1")}
                            />
                            <label htmlFor="risk-q1-d" className="ml-3 block text-sm text-gray-700">
                              I would see this as an opportunity to invest more
                            </label>
                          </div>
                        </div>
                        {riskAppetiteForm.formState.errors.riskQuestion1 && (
                          <p className="mt-1 text-sm text-red-600">{riskAppetiteForm.formState.errors.riskQuestion1.message}</p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-gray-700 mb-2">What is your primary investment goal?</p>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              id="risk-q2-a"
                              name="riskQuestion2"
                              type="radio"
                              value="preservation"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              {...riskAppetiteForm.register("riskQuestion2")}
                            />
                            <label htmlFor="risk-q2-a" className="ml-3 block text-sm text-gray-700">
                              Capital preservation (minimize risk of loss)
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="risk-q2-b"
                              name="riskQuestion2"
                              type="radio"
                              value="income"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              {...riskAppetiteForm.register("riskQuestion2")}
                            />
                            <label htmlFor="risk-q2-b" className="ml-3 block text-sm text-gray-700">
                              Income generation (stable dividend/interest income)
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="risk-q2-c"
                              name="riskQuestion2"
                              type="radio"
                              value="balanced"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              {...riskAppetiteForm.register("riskQuestion2")}
                            />
                            <label htmlFor="risk-q2-c" className="ml-3 block text-sm text-gray-700">
                              Balanced growth (mix of growth and income)
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="risk-q2-d"
                              name="riskQuestion2"
                              type="radio"
                              value="aggressive"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              {...riskAppetiteForm.register("riskQuestion2")}
                            />
                            <label htmlFor="risk-q2-d" className="ml-3 block text-sm text-gray-700">
                              Aggressive growth (maximum long-term returns)
                            </label>
                          </div>
                        </div>
                        {riskAppetiteForm.formState.errors.riskQuestion2 && (
                          <p className="mt-1 text-sm text-red-600">{riskAppetiteForm.formState.errors.riskQuestion2.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Consent Checkbox (Only on Personal Info Tab) */}
          {activeTab === 0 && (
            <div className="p-4 bg-blue-50 border-t border-blue-200">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Checkbox
                    id="privacy-consent"
                    checked={privacyConsent}
                    onCheckedChange={(checked) => setPrivacyConsent(checked as boolean)}
                    className="border-blue-400"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="privacy-consent" className="font-medium text-blue-900">
                    I have read and agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-blue-600 hover:text-blue-800 underline font-semibold"
                    >
                      Privacy Policy
                    </button>
                  </label>
                  <p className="text-blue-700 mt-1">
                    You must accept the privacy policy to proceed with entering your financial data.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="p-8 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={activeTab === 0}
              className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${activeTab === 0 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={activeTab === 0 ? !privacyConsent || isSubmitting : isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting && activeTab === tabs.length - 1 ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                activeTab === tabs.length - 1 ? 'Submit' : 'Next'
              )}
            </button>
          </div>
        </div>

        {/* Start Over button */}
        <button
          type="button"
          onClick={handleStartOver}
          className="mt-6 text-sm text-gray-600 hover:text-gray-800 flex items-center mx-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Start Over
        </button>
      </div>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal open={showPrivacyModal} onOpenChange={setShowPrivacyModal} />
    </div>
  );
}