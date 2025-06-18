export interface NavItem {
  label: string;
  path: string;
  children?: NavItem[];
}

export interface Routes {
  [key: string]: string;
}

export interface ApiEndpoints {
  [key: string]:
    | string
    | {
        [key: string]: string;
      };
}
