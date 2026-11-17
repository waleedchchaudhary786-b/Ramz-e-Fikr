/* Where the facts on each page come from. Keyed by essay or resource slug.
   `usedFor` says which claim on the page the source supports. Pages whose
   argument is the author's own say so in `basis`. */

export type Source = { title: string; publisher: string; year?: string; url: string; usedFor: string }
export type SourceSet = { basis?: string; list: Source[] }

const WUDC: Source = {
  title: 'WUDC Debating and Judging Manual',
  publisher: 'World Universities Debating Championships',
  year: '2026 edition',
  url: 'https://www.worlddebating.org/wudc-manual',
  usedFor: 'The rules of British Parliamentary debating: speaker roles, extensions, knifing, points of information, whip speeches and how judges decide.',
}
const HARVEY_SMITH: Source = {
  title: 'The Practical Guide to Debating: Worlds Style / British Parliamentary Style',
  publisher: 'Neill Harvey-Smith, International Debate Education Association',
  year: '2011',
  url: 'https://idebate.net/Publications/PDFs/The%20Practical%20Guide%20to%20Debating_Worlds%20Style,%20British%20Parliamentary%20Style%20-%20%20Neill%20Harvey-Smith.pdf',
  usedFor: 'Background on the format, definitional challenges and the role of each team.',
}
const WUDC_TRAINING: Source = {
  title: 'Training Resources',
  publisher: 'World Universities Debating Council',
  url: 'https://worlddebating.org/training-resources',
  usedFor: 'Introductory judge training for the British Parliamentary format.',
}
const OWN_ESSAY = 'This essay is the author’s own argument about debating practice and makes no outside factual claims. Where it describes the rules of the format, it follows the manual below.'

export const sources: Record<string, SourceSet> = {
  /* ---------- essays ---------- */
  'rebuttal-is-listening': { basis: OWN_ESSAY, list: [WUDC] },
  'evidence-is-not-an-argument': { basis: OWN_ESSAY, list: [WUDC] },
  'the-case-for-losing': { basis: 'This essay is the author’s own argument about how clubs train novices. It makes no outside factual claims.', list: [] },
  'the-whip-is-a-judge': { basis: OWN_ESSAY, list: [WUDC] },
  'speed-is-not-depth': { basis: OWN_ESSAY, list: [WUDC] },
  'judge-a-round-this-term': { basis: OWN_ESSAY, list: [WUDC, WUDC_TRAINING] },
  'prep-is-a-conversation': { basis: OWN_ESSAY, list: [WUDC] },
  'set-motions-at-home': {
    basis: 'This essay is the author’s own argument. The proposal is the author’s, not an existing rule.',
    list: [WUDC],
  },
  'urdu-debate-is-not-a-translation': {
    basis: 'The argument is the author’s own. The descriptions of the mushaira and munazara traditions come from the sources below.',
    list: [
      { title: 'Mushaira: A History of Thunderous and Traditional Waah-Waahs', publisher: 'Rekhta Blog', url: 'https://blog.rekhta.org/?p=4001', usedFor: 'The mushaira as a gathering of poets with a participative, responsive audience.' },
      { title: 'Mushairah', publisher: 'Encyclopaedia Britannica', url: 'https://www.britannica.com/topic/mushairah', usedFor: 'The mushaira’s place in Urdu literary culture.' },
      { title: 'Disputation', publisher: 'Encyclopedia.com (Encyclopedia of Islam and the Muslim World)', url: 'https://encyclopedia.com/religion/encyclopedias-almanacs-transcripts-and-maps/disputation', usedFor: 'Munazara as rule-governed disputation with an opponent, and the rules of conduct in debate.' },
      { title: 'Munazarah Literature in Urdu', publisher: 'Internet Archive (journal article)', url: 'https://ia801908.us.archive.org/15/items/MunazarahLiteratureInUrduAnExtraCurricularEducationalInputInPakistansReligiousEducation/Munazarah%20Literature%20in%20Urdu_An%20Extra-Curricular%20Educational%20Input%20in%20Pakistan%27s%20Religious%20Education.pdf', usedFor: 'The munazara tradition in Urdu and in South Asian education.' },
    ],
  },

  /* ---------- craft resources ---------- */
  'first-principles-casebuilding': { basis: 'A teaching method written for this archive. The format rules it assumes come from the manual below.', list: [WUDC] },
  'weighing-worksheet': { basis: 'A teaching worksheet written for this archive.', list: [WUDC] },
  'poi-drills': { basis: 'Drills written for this archive. The rules on points of information and protected time come from the sources below.', list: [WUDC, HARVEY_SMITH] },
  'adjudication-notes': { list: [WUDC, WUDC_TRAINING] },
  'speaker-roles': { list: [WUDC, HARVEY_SMITH] },
  'extensions-guide': { basis: 'The five places to look are a teaching method written for this archive. The rules on extensions and knifing come from the manual.', list: [WUDC] },
  'models-and-definitions': { list: [WUDC, HARVEY_SMITH] },
  'motion-analysis-drills': { basis: 'A worksheet written for this archive. It makes no outside factual claims.', list: [] },
  'first-time-judging': { list: [WUDC, WUDC_TRAINING] },
  'urdu-speaking-toolkit': {
    basis: 'The phrases and drills were written for this archive. The background on the mushaira comes from the source below.',
    list: [{ title: 'Mushaira: A History of Thunderous and Traditional Waah-Waahs', publisher: 'Rekhta Blog', url: 'https://blog.rekhta.org/?p=4001', usedFor: 'Background on the mushaira tradition.' }],
  },

  /* ---------- casefiles ---------- */
  'pk-economy-casefile': {
    list: [
      { title: 'IMF Conditionality', publisher: 'International Monetary Fund (factsheet)', year: '2025', url: 'https://www.imf.org/en/About/Factsheets/Sheets/2023/IMF-Conditionality', usedFor: 'What conditionality is: a borrowing government agrees to adjust its policies, with measurable performance criteria.' },
      { title: 'IMF Lending', publisher: 'International Monetary Fund (factsheet)', year: '2025', url: 'https://www.imf.org/en/about/factsheets/imf-lending', usedFor: 'Why countries borrow, and the Proposition claim that a programme signals credibility.' },
      { title: 'What types of financing does the IMF provide?', publisher: 'Bretton Woods Project', year: '2020', url: 'https://www.brettonwoodsproject.org/2020/10/what-types-of-financing-does-the-imf-provide/', usedFor: 'How lending instruments differ, with links to the main criticisms Opposition benches draw on.' },
    ],
  },
  'smog-casefile': {
    list: [
      { title: 'New report links Pakistan’s smog to local emissions, Punjab EPA rejects findings', publisher: 'Profit (Pakistan Today)', year: '2026', url: 'https://profit.pakistantoday.com.pk/?p=220679', usedFor: 'The PAQI estimate of Lahore’s emission sources (transport 35%, heavy industry 28%, brick kilns 17%) and the Punjab EPA’s rejection of it.' },
      { title: 'Lahore’s smog: Where are the results?', publisher: 'Business Recorder', year: '2026', url: 'https://www.brecorder.com/news/amp/40448198', usedFor: 'The same source shares, and the gaps in data and enforcement found by SPDC.' },
      { title: 'Reducing Pollution from Crop Burning', publisher: 'University of Chicago Energy & Environment Lab', url: 'https://urbanlabs.uchicago.edu/projects/reducing-pollution-from-crop-burning', usedFor: 'The estimate that about 20% of smog in Punjab comes from rice residue burning, and the shredder and Happy Seeder programme.' },
      { title: 'Lahore’s air pollution a year-round problem, worsened by winter and agricultural burning', publisher: 'Dawn', url: 'https://dawn.com/news/2042329', usedFor: 'Pollution as a year-round problem made worse by winter weather and crop burning.' },
      { title: 'Temperature Inversion', publisher: 'UCAR Center for Science Education', url: 'https://scied.ucar.edu/image/temperature-inversion', usedFor: 'How a temperature inversion traps pollution near the ground.' },
      { title: 'Air Quality Index (AQI) Basics', publisher: 'AirNow (US EPA)', url: 'https://www.airnow.gov/aqi/aqi-basics/', usedFor: 'What the AQI measures and its six categories.' },
    ],
  },
  'student-unions-casefile': {
    list: [
      { title: 'Proposed Revival of Students Unions in Pakistan', publisher: 'PILDAT', year: '2008', url: 'https://pildat.org/?p=3513', usedFor: 'The ban was imposed through martial law orders in February 1984 under General Zia-ul-Haq.' },
      { title: 'Rare unity in Sindh Assembly over passage of bill to revive students’ union', publisher: 'Dawn', year: '2022', url: 'https://www.dawn.com/news/1674554', usedFor: 'Sindh passing the Students Union Bill unanimously in February 2022, and its ban on weapons and hate speech on campus.' },
      { title: 'Sindh cabinet approves bill to restore student unions', publisher: 'Arab News Pakistan', year: '2019', url: 'https://www.arabnews.pk/node/1596836', usedFor: 'The brief revival in 1989 and the Supreme Court ruling of 1993.' },
      { title: '42 years on, no government has kept its promise to restore student unions', publisher: 'The News', year: '2026', url: 'https://www.thenews.pk/print/1398042-42-years-on-no-government-has-kept-its-promise-to-restore-student-unions', usedFor: 'The position in 2026, including the Sindh High Court dismissing a restoration petition.' },
      { title: 'Cautious optimism: students welcome restoration of student unions in Sindh', publisher: 'The Friday Times', year: '2022', url: 'https://thefridaytimes.com/2022/02/12/cautious-optimism-students-welcome-restoration-of-student-unions-in-sindh-seek-implementation', usedFor: 'Students’ doubts about whether the Sindh law would be implemented.' },
    ],
  },
  'medium-of-instruction-casefile': {
    list: [
      { title: 'Punjabi tops as ‘most spoken language’ in Pakistan', publisher: 'Geo News, reporting Pakistan Bureau of Statistics census 2023', year: '2024', url: 'https://www.geo.tv/latest/574766-punjabi-tops-as-most-spoken-language-in-pakistan', usedFor: 'Punjabi as the most common mother tongue (about 37%).' },
      { title: 'Unity in Diversity: Exploring Pakistan’s Linguistic Landscape', publisher: 'ISSRA, National Defence University', year: '2025', url: 'https://issra.pk/insight/2025/unity-in-diversity-exploring-pakistans-linguistic-landscape/insight.html', usedFor: 'Census 2023 shares by mother tongue, including Urdu at about 9%.' },
      { title: 'Enhancing Learning of Children from Diverse Language Backgrounds', publisher: 'Jessica Ball, UNESCO', year: '2010', url: 'https://www.gcedclearinghouse.org/resources/enhancing-learning-children-diverse-language-backgrounds-mother-tongue-based-bilingual-or', usedFor: 'The case for mother-tongue-based education in the early years, and UNESCO’s support for it since 1953.' },
      { title: 'Children learn better in their mother tongue', publisher: 'Global Partnership for Education', url: 'https://www.globalpartnership.org:443/blog/children-learn-better-their-mother-tongue', usedFor: 'Children whose home language is not the school language being more likely to drop out or fail early grades.' },
      { title: 'The Impact of Native Language-Based Education on Learning in Multilingual Contexts', publisher: 'Innovations for Poverty Action', url: 'https://poverty-action.org/node/53505/pdf', usedFor: 'The opposing evidence: mixed results from mother-tongue policies in Kenya and Ethiopia.' },
      { title: 'Multilingual classrooms in practice', publisher: 'World Education Blog (UNESCO GEM Report)', year: '2023', url: 'https://world-education-blog.org/2023/02/22/multilingual-classrooms-in-practice/', usedFor: 'A Pakistani example of teaching in Dhatki and Sindhi first, then moving to official languages.' },
    ],
  },
  'tech-ai-casefile': {
    basis: 'The four frames are a teaching method written for this archive. The policy background comes from the source below.',
    list: [
      { title: 'Guidance for Generative AI in Education and Research', publisher: 'UNESCO (Miao and Holmes)', year: '2023', url: 'https://unesdoc.unesco.org/ark:/48223/pf0000386693', usedFor: 'The risks of AI in education to equity and inclusion, data privacy, and the suggestion of an age limit.' },
    ],
  },
}
