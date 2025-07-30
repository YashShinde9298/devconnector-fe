export interface Experience {
    id: string
    company: string
    position: string
    startDate: string
    endDate: string
    description: string
    present: boolean
}

export interface Education {
    id: string
    instituteName: string
    degree: string
    startDate: string
    endDate: string
}

export interface Certification {
    id: string
    name: string
    issuingOrganization: string
    issueDate: string
}