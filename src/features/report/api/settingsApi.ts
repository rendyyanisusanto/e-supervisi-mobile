import { apiClient as httpClient } from '@/core/api/axios';

export interface SchoolProfile {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  principalName: string;
  principalNip: string;
  curriculumName: string;
  curriculumNip: string;
  city: string;
  logo: string | null;
  reportFooter: string;
}

export interface ReportSettings {
  id?: string;
  headerStyle: 'FORMAL' | 'MODERN' | 'SIMPLE';
  showLogo: boolean;
  showSchoolAddress: boolean;
  showSupervisorSignature: boolean;
  showCurriculumSignature: boolean;
  showPrincipalSignature: boolean;
  useQrValidation: boolean;
  footerText: string;
}

// Helper mapper to convert from backend casing if needed, matching the web app's settingMapper.ts
const SettingMapper = {
  profileToFrontend(data: any): SchoolProfile {
    return {
      id: data.id,
      name: data.name || 'SMK IT ASY-SYADZILI',
      address: data.address || 'Jl. Pesantren No. 1, Sumberpasir, Pakis, Malang',
      phone: data.phone || '-',
      email: data.email || '-',
      website: data.website || '-',
      principalName: data.principal_name || '_________________________',
      principalNip: data.principal_nip || '-',
      curriculumName: data.curriculum_name || '_________________________',
      curriculumNip: data.curriculum_nip || '-',
      city: data.city || 'Malang',
      logo: data.logo || null,
      reportFooter: data.report_footer || 'Dicetak dari Sistem E-Supervisi SMK'
    };
  },
  reportSettingToFrontend(data: any): ReportSettings {
    return {
      id: data.id,
      headerStyle: data.header_style || 'FORMAL',
      showLogo: data.show_logo !== false,
      showSchoolAddress: data.show_school_address !== false,
      showSupervisorSignature: data.show_supervisor_signature !== false,
      showCurriculumSignature: data.show_curriculum_signature !== false,
      showPrincipalSignature: data.show_principal_signature !== false,
      useQrValidation: data.use_qr_validation || false,
      footerText: data.footer_text || 'Dicetak dari Sistem E-Supervisi SMK'
    };
  }
};

export const SettingsApi = {
  async getProfile(): Promise<SchoolProfile> {
    const response = await httpClient.get('/settings/school-profile');
    return SettingMapper.profileToFrontend(response.data.data);
  },

  async getReportSettings(): Promise<ReportSettings> {
    const response = await httpClient.get('/settings/report-settings');
    return SettingMapper.reportSettingToFrontend(response.data.data);
  }
};
