export type JiraTasks = {
  expand:     string;
  startAt:    number;
  maxResults: number;
  total:      number;
  issues:     Issue[];
}

export type Issue = {
  expand: string;
  id:     string;
  self:   string;
  key:    string;
  fields: IssueFields;
}

export type IssueFields = {
  statuscategorychangedate:      string;
  parent:                        Parent;
  customfield_10070:             null;
  customfield_10071:             null | string;
  customfield_10072:             number | null;
  customfield_10073:             null;
  customfield_10076:             null;
  customfield_10077:             null;
  fixVersions:                   any[];
  customfield_10078:             null;
  resolution:                    Priority | null;
  customfield_10079:             null;
  lastViewed:                    null | string;
  customfield_10060:             null;
  customfield_10061:             null;
  customfield_10062:             any[];
  priority:                      Priority;
  customfield_10068:             null;
  customfield_10069:             null;
  labels:                        string[];
  aggregatetimeoriginalestimate: number | null;
  timeestimate:                  number | null;
  versions:                      any[];
  issuelinks:                    Issuelink[];
  assignee:                      Creator | null;
  status:                        Status;
  components:                    any[];
  customfield_10050:             null;
  customfield_10051:             null;
  customfield_10052:             null;
  customfield_10053:             null;
  customfield_10054:             null;
  customfield_10055:             null;
  customfield_10056:             Customfield100 | null;
  customfield_10057:             Customfield100 | null;
  customfield_10058:             Customfield100 | null;
  customfield_10059:             Customfield100 | null;
  customfield_10049:             null;
  aggregatetimeestimate:         number | null;
  creator:                       Creator;
  subtasks:                      any[];
  customfield_10040:             null;
  customfield_10041:             null;
  customfield_10042:             null;
  reporter:                      Creator;
  customfield_10043:             null;
  customfield_10044:             null;
  aggregateprogress:             Progress;
  customfield_10045:             null;
  customfield_10046:             null;
  customfield_10047:             null;
  customfield_10048:             null;
  customfield_10038:             Customfield10038 | null;
  customfield_10039:             null;
  progress:                      Progress;
  votes:                         Votes;
  issuetype:                     Issuetype;
  timespent:                     number | null;
  customfield_10030:             Customfield1003;
  project:                       Project;
  aggregatetimespent:            number | null;
  customfield_10034:             any[];
  customfield_10035:             null;
  customfield_10036:             null;
  customfield_10037:             null;
  customfield_10029:             Creator | null;
  resolutiondate:                null | string;
  workratio:                     number;
  watches:                       Watches;
  created:                       string;
  customfield_10020:             Customfield10020[];
  customfield_10021:             null;
  customfield_10022:             null;
  customfield_10023:             null;
  customfield_10024:             null | string;
  customfield_10025:             null | string;
  customfield_10016:             null;
  customfield_10017:             null;
  customfield_10018:             Customfield10018;
  customfield_10019:             string;
  updated:                       string;
  timeoriginalestimate:          number | null;
  description:                   DescriptionClass | null;
  customfield_10010:             Customfield100 | null;
  customfield_10014:             string;
  customfield_10015:             null;
  customfield_10005:             null;
  customfield_10006:             null;
  security:                      null;
  customfield_10007:             null;
  customfield_10008:             null;
  customfield_10009:             null;
  summary:                       string;
  customfield_10080:             null;
  customfield_10081:             null;
  customfield_10082:             null;
  customfield_10083:             null;
  customfield_10084:             null;
  customfield_10085:             null;
  customfield_10086:             null;
  customfield_10000:             string;
  customfield_10001:             null;
  customfield_10002:             null;
  customfield_10003:             null;
  customfield_10004:             null;
  environment:                   null;
  duedate:                       null;
  customfield_10031?:            null;
  customfield_10026?:            number | null;
  customfield_10032?:            Customfield1003;
}

export type Progress = {
  progress: number;
  total:    number;
  percent?: number;
}

export type Creator = {
  self:          string;
  accountId:     string;
  avatarUrls:    AvatarUrls;
  displayName:   string;
  active:        boolean;
  timeZone:      string;
  accountType:   string;
  emailAddress?: string;
}

export type AvatarUrls = {
  "48x48": string;
  "24x24": string;
  "16x16": string;
  "32x32": string;
}

export type Customfield100 = {
  errorMessage:     string;
  i18nErrorMessage: I18NErrorMessage;
}

export type I18NErrorMessage = {
  i18nKey:    string;
  parameters: any[];
}

export type Customfield10018 = {
  hasEpicLinkFieldDependency: boolean;
  showField:                  boolean;
  nonEditableReason:          NonEditableReason;
}

export type NonEditableReason = {
  reason:  string;
  message: string;
}

export type Customfield10020 = {
  id:            number;
  name:          string;
  state:         string;
  boardId:       number;
  goal:          string;
  startDate?:    Date;
  endDate?:      Date;
  completeDate?: Date;
}

export type Customfield1003 = {
  self:  string;
  value: string;
  id:    string;
}

export type Customfield10038 = {
  languageCode: string;
  displayName:  string;
}

export type DescriptionClass = {
  version: number;
  type:    string;
  content: DescriptionContent[];
}

export type DescriptionContent = {
  type:    string;
  content: PurpleContent[];
  attrs?:  PurpleAttrs;
}

export type PurpleAttrs = {
  layout:                 string;
  isNumberColumnEnabled?: boolean;
  localId?:               string;
}

export type PurpleContent = {
  type:     string;
  text?:    string;
  attrs?:   FluffyAttrs;
  content?: FluffyContent[];
  marks?:   FluffyMark[];
}

export type FluffyAttrs = {
  id?:         string;
  type?:       string;
  collection?: string;
  width?:      number;
  height?:     number;
  url?:        string;
}

export type FluffyContent = {
  type:    string;
  attrs?:  TentacledAttrs;
  content: TentacledContent[];
}

export type TentacledAttrs = {
}

export type TentacledContent = {
  type:     string;
  content?: StickyContent[];
  attrs?:   StickyAttrs;
  text?:    string;
}

export type StickyAttrs = {
  layout?: string;
  url?:    string;
}

export type StickyContent = {
  type:   string;
  text?:  string;
  marks?: PurpleMark[];
  attrs?: FluffyAttrs;
}

export type PurpleMark = {
  type: string;
}

export type FluffyMark = {
  type:  string;
  attrs: MarkAttrs;
}

export type MarkAttrs = {
  href: string;
}

export type Issuelink = {
  id:            string;
  self:          string;
  type:          TypeClass;
  outwardIssue?: Parent;
  inwardIssue?:  Parent;
}

export type Parent = {
  id:     string;
  key:    string;
  self:   string;
  fields: ParentFields;
}

export type ParentFields = {
  summary:   string;
  status:    Status;
  priority:  Priority;
  issuetype: Issuetype;
}

export type Issuetype = {
  self:           string;
  id:             string;
  description:    string;
  iconUrl:        string;
  name:           string;
  subtask:        boolean;
  avatarId?:      number;
  hierarchyLevel: number;
}

export type Priority = {
  self:         string;
  iconUrl?:     string;
  name:         string;
  id:           string;
  description?: string;
}

export type Status = {
  self:           string;
  description:    string;
  iconUrl:        string;
  name:           string;
  id:             string;
  statusCategory: StatusCategory;
}

export type StatusCategory = {
  self:      string;
  id:        number;
  key:       string;
  colorName: string;
  name:      string;
}

export type TypeClass = {
  id:      string;
  name:    string;
  inward:  string;
  outward: string;
  self:    string;
}

export type Project = {
  self:           string;
  id:             string;
  key:            string;
  name:           string;
  projectTypeKey: string;
  simplified:     boolean;
  avatarUrls:     AvatarUrls;
}

export type Votes = {
  self:     string;
  votes:    number;
  hasVoted: boolean;
}

export type Watches = {
  self:       string;
  watchCount: number;
  isWatching: boolean;
}


export type Task = {
  name: string
  storyId: string
  storyName: string
  statusName: string
  imageAssign: string
}

export const tasks = async (): Promise<Task[]> => {
  const response = await fetch(`${import.meta.env.JIRA_DOMAIN}/rest/api/3/search`, {
    method: 'POST',
    body: JSON.stringify({
      maxResults: 50,
      jql: 'Sprint in openSprints() AND assignee != null'
    }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Basic ${import.meta.env.JIRA_AUTHORIZATION}`
    }
  })
  const {issues = []} = await response.json() as JiraTasks;

  if(!issues.length) return []

  return issues.map((issue) => {
    const {fields} = issue
    const {summary, parent, status, assignee} = fields
    const {key, fields: parentFields} = parent
    const {summary: parentSummary} = parentFields
    const {name: statusName} = status

    return {
      name: summary,
      storyId: key,
      storyName: parentSummary,
      statusName: statusName,
      imageAssign: assignee?.avatarUrls['16x16'] ?? ''
    }
  });
}
