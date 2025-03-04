// App.tsx or another component file
import React from 'react';
import ChartDashboard from './ChartDashboard';

const ReportDashboardExample = () => {
  // Skills by Department dataset
  const skillsByDepartmentData = [
    { Department: "Engineering", Skill: "Programming", SkillCoverage: 85, RequiredProficiency: 90 },
    { Department: "Engineering", Skill: "Testing", SkillCoverage: 70, RequiredProficiency: 75 },
    { Department: "Engineering", Skill: "DevOps", SkillCoverage: 60, RequiredProficiency: 80 },
    { Department: "Marketing", Skill: "SEO", SkillCoverage: 75, RequiredProficiency: 85 },
    { Department: "Marketing", Skill: "Content Writing", SkillCoverage: 90, RequiredProficiency: 80 },
    { Department: "Sales", Skill: "Negotiation", SkillCoverage: 95, RequiredProficiency: 90 },
    { Department: "Sales", Skill: "CRM", SkillCoverage: 65, RequiredProficiency: 70 }
  ];

  // Department Comparison dataset
  const departmentComparisonData = [
    { Department: "Engineering", Metric: "Productivity", Value: 82 },
    { Department: "Engineering", Metric: "Satisfaction", Value: 78 },
    { Department: "Engineering", Metric: "Retention", Value: 85 },
    { Department: "Marketing", Metric: "Productivity", Value: 75 },
    { Department: "Marketing", Metric: "Satisfaction", Value: 82 },
    { Department: "Marketing", Metric: "Retention", Value: 80 },
    { Department: "Sales", Metric: "Productivity", Value: 88 },
    { Department: "Sales", Metric: "Satisfaction", Value: 75 },
    { Department: "Sales", Metric: "Retention", Value: 72 }
  ];

  // Skill Distribution dataset
  const skillDistributionData = [
    { Skill: "Programming", Count: 45, Percentage: 22.5 },
    { Skill: "Project Management", Count: 30, Percentage: 15 },
    { Skill: "Data Analysis", Count: 25, Percentage: 12.5 },
    { Skill: "UX Design", Count: 15, Percentage: 7.5 },
    { Skill: "Marketing", Count: 20, Percentage: 10 },
    { Skill: "Sales", Count: 35, Percentage: 17.5 },
    { Skill: "Customer Support", Count: 30, Percentage: 15 }
  ];

  // Proficiency Heatmap dataset
  const proficiencyHeatmapData = [
    { Department: "Engineering", Skill: "Programming", RequiredProficiency: 90, ActualProficiency: 85 },
    { Department: "Engineering", Skill: "Testing", RequiredProficiency: 80, ActualProficiency: 75 },
    { Department: "Marketing", Skill: "SEO", RequiredProficiency: 85, ActualProficiency: 70 },
    { Department: "Marketing", Skill: "Content Writing", RequiredProficiency: 90, ActualProficiency: 85 },
    { Department: "Sales", Skill: "Negotiation", RequiredProficiency: 95, ActualProficiency: 90 },
    { Department: "Sales", Skill: "CRM", RequiredProficiency: 85, ActualProficiency: 65 }
  ];

  // Example of async data provider
  const fetchReportData = async (reportId: string) => {
    // In a real app, this would likely be an API call
    console.log(`Fetching data for report: ${reportId}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return appropriate data based on report ID
    switch (reportId) {
      case 'custom-report':
        // Demo of getting data from an API in a real app
        // const response = await fetch(`/api/reports/${reportId}`);
        // return await response.json();
        return [
          { Category: "A", Value: Math.random() * 100 },
          { Category: "B", Value: Math.random() * 100 },
          { Category: "C", Value: Math.random() * 100 }
        ];
      default:
        return [];
    }
  };

  // Report definitions with attached datasets
  const reports = [
    {
      id: 'skills-by-department',
      name: 'Skills by Department',
      description: 'Analyze skill coverage and proficiency across departments',
      defaultChartType: 'bar',
      recommendedCharts: ['bar', 'radar', 'heatmap'],
      dataset: skillsByDepartmentData,
      requiredFields: ['Department', 'Skill', 'SkillCoverage'],
      numericFields: ['SkillCoverage', 'RequiredProficiency'],
      defaultConfig: {
        xField: 'Department',
        yField: 'SkillCoverage',
        seriesField: 'Skill',
        title: 'Skill Coverage by Department',
        showDataZoom: true,
        sortData: false
      }
    },
    {
      id: 'department-comparison',
      name: 'Department Comparison',
      description: 'Compare performance metrics across departments',
      defaultChartType: 'radar',
      recommendedCharts: ['radar', 'bar', 'line'],
      dataset: departmentComparisonData,
      requiredFields: ['Department', 'Metric', 'Value'],
      numericFields: ['Value'],
      defaultConfig: {
        xField: 'Metric',
        yField: 'Value',
        seriesField: 'Department',
        title: 'Department Performance Comparison',
        sortData: true
      }
    },
    {
      id: 'skill-distribution',
      name: 'Skill Distribution',
      description: 'View distribution of skills across the organization',
      defaultChartType: 'pie',
      recommendedCharts: ['pie', 'treemap', 'funnel'],
      dataset: skillDistributionData,
      requiredFields: ['Skill', 'Count'],
      numericFields: ['Count', 'Percentage'],
      defaultConfig: {
        xField: 'Skill',
        yField: 'Count',
        title: 'Skill Distribution',
        subtitle: 'Count of team members with each skill',
        sortData: true
      }
    },
    {
      id: 'proficiency-heatmap',
      name: 'Proficiency Heatmap',
      description: 'Visualize skill proficiency levels across departments',
      defaultChartType: 'heatmap',
      recommendedCharts: ['heatmap', 'bar'],
      dataset: proficiencyHeatmapData,
      requiredFields: ['Department', 'Skill', 'RequiredProficiency', 'ActualProficiency'],
      numericFields: ['RequiredProficiency', 'ActualProficiency'],
      defaultConfig: {
        xField: 'Department',
        yField: 'Skill',
        seriesField: 'ActualProficiency',
        title: 'Actual Proficiency Heatmap',
        aggregationType: 'average'
      }
    },
    {
      id: 'custom-report',
      name: 'Custom Report',
      description: 'Create your own custom visualization with dynamically loaded data',
      defaultChartType: 'bar',
      recommendedCharts: ['bar', 'line', 'pie'],
      // No dataset - this will use the dataProvider function
      dataProvider: async () => {
        // This could be an API call in a real application
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
        return [
          { Category: "X", Value: Math.random() * 100 },
          { Category: "Y", Value: Math.random() * 100 },
          { Category: "Z", Value: Math.random() * 100 }
        ];
      },
      defaultConfig: {
        xField: 'Category',
        yField: 'Value',
        title: 'Custom Dynamic Data'
      }
    }
  ];

  return (
    <div className="rounded border border-stone-300 shadow-sm bg-white h-full w-full mx-auto p-4 col-span-12">
      <h1 className="text-3xl font-bold mb-6">Organization Analytics Dashboard</h1>

      <ChartDashboard
        reports={reports}
        dataProvider={fetchReportData} // Fallback data provider
      />

      {/* <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h2 className="text-xl font-semibold mb-2">About This Dashboard</h2>
        <p className="mb-4">
          This dashboard demonstrates different approaches to loading data for different reports:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Static datasets attached directly to report definitions</li>
          <li>Per-report async data providers for dynamic data</li>
          <li>Global fallback data provider for custom reports</li>
        </ul>
      </div> */}
    </div>
  );
};

export default ReportDashboardExample;