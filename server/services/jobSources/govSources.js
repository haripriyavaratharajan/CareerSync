// Official recruitment websites (homepages). Announcements are read only from links these sites publish.
// Add more with GOV_EXTRA='[{"key":"rrb-chennai","name":"RRB Chennai","level":"central","url":"https://..."}]'
export const GOV = [
  { key: 'tnpsc', name: 'TNPSC', level: 'state', state: 'Tamil Nadu', url: 'https://www.tnpsc.gov.in' },
  { key: 'tnusrb', name: 'TNUSRB', level: 'state', state: 'Tamil Nadu', url: 'https://www.tnusrb.tn.gov.in' },
  { key: 'trb', name: 'TN TRB', level: 'state', state: 'Tamil Nadu', url: 'https://trb.tn.gov.in' },
  { key: 'mrb', name: 'TN MRB', level: 'state', state: 'Tamil Nadu', url: 'https://mrb.tn.gov.in' },
  { key: 'upsc', name: 'UPSC', level: 'central', url: 'https://upsc.gov.in' },
  { key: 'ssc', name: 'SSC', level: 'central', url: 'https://ssc.gov.in' },
  { key: 'rrb', name: 'RRB (Chandigarh)', level: 'central', url: 'https://www.rrbcdg.gov.in' },
  { key: 'ncs', name: 'National Career Service', level: 'central', url: 'https://www.ncs.gov.in' },
  { key: 'employment-news', name: 'Employment News', level: 'central', url: 'https://www.employmentnews.gov.in' },
  ...JSON.parse(process.env.GOV_EXTRA || '[]'),
];
