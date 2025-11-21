export type Exp = {
  role: string;
  company: string;
  start: string;
  end: string;
  desc: string;
};

export type Edu = {
  course: string;
  school: string;
  start: string;
  end: string;
};

export type Proj = {
  name: string;
  link?: string;
  desc?: string;
};

export type Cert = {
  name: string;
  org?: string;
  year?: string;
};

export type Lnk = {
  label: string;
  url: string;
};

export type CurriculoData = {
  name: string;
  email: string;
  role: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experiences: Exp[];
  education: Edu[];
  projects: Proj[];
  certs: Cert[];
  links: Lnk[];
  completeness: number;
};
