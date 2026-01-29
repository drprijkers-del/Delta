export const translations = {
  nl: {
    // General
    pinkPollos: 'Pink Pollos',
    labTool: 'Agile Interventions',
    pulse: 'Delta',
    admin: 'Admin',
    error: 'Er ging iets mis',
    loading: 'Laden...',
    save: 'Opslaan',
    cancel: 'Annuleren',
    create: 'Aanmaken',

    // Homepage
    homeTitle: 'Delta',
    homeSubtitle: 'Agile Interventies',
    homeDescription: 'Time-boxed interventies voor Agile teams. Eén focus, één experiment, één eigenaar.',
    homeFeature1: 'Scherp',
    homeFeature2: 'Anoniem',
    homeFeature3: 'Actie',
    homeAskTeamLead: 'Vraag je Scrum Master om een Delta link',
    homeFooter: 'Agile Interventions',
    homeScrumMasterCTA: 'Ik ben Scrum Master',
    homeScrumMasterSubtext: 'Start in 30 seconden',
    homeAlreadyAccount: 'Al een account?',
    homeAdminLogin: 'Admin login',
    homeLabAccess: 'Toegang',

    // Login
    loginWelcome: 'Welkom bij Delta',
    loginSubtitle: 'Vul je email in voor toegang',
    loginEmail: 'Email',
    loginEmailPlaceholder: 'jouw@email.nl',
    loginButton: 'Verstuur link',
    loginLoading: 'Bezig...',
    loginNoPassword: 'Geen wachtwoord nodig.',
    loginCheckInbox: 'Check je inbox',
    loginEmailSent: 'We hebben een login link gestuurd naar',
    loginClickLink: 'Klik op de link in de email om in te loggen.',
    loginOtherEmail: 'Andere email?',
    loginUnauthorized: 'Je email staat niet in de admin lijst.',
    loginForgotPassword: '',
    loginAdminAccess: 'Admin',

    // Team signal input (Delta sessions)
    checkinQuestion: 'Beoordeel deze stelling',
    checkinToday: 'vandaag',
    checkinName: 'Alias (optioneel)',
    checkinComment: 'Toelichting (optioneel)',
    checkinButton: 'Verstuur',
    checkinLoading: 'Verwerken...',
    checkinAnonymous: 'Volledig anoniem',

    // Signal levels (1-5 scale)
    moodVeryBad: '1',
    moodBad: '2',
    moodOkay: '3',
    moodGood: '4',
    moodGreat: '5',

    // Success
    successTitle: 'Antwoord ontvangen',
    successRecorded: 'Je input is genoteerd',
    successStreak: 'sessies ingevuld',
    successStreakSingular: 'sessie ingevuld',
    successKeepGoing: 'Goed bezig!',
    successFirstCheckin: 'Je eerste respons is binnen',
    successOnFire: 'Top bijdrager!',
    successTopPerformer: 'Top contributor',
    successTeamToday: 'Team vandaag',
    successAverage: 'gemiddeld',
    successCheckins: 'reacties',
    successSeeYouTomorrow: 'Bedankt voor je input.',

    // Already submitted
    alreadyTitle: 'Al ingevuld',
    alreadyMessage: 'Je hebt deze sessie al ingevuld.',
    alreadyCheckedToday: 'reacties vandaag',

    // Coaching tips
    coachingTipTitle: 'Tip',
    coachingTipLow: 'Lage score? Bespreek het in de retro of met je Scrum Master.',
    coachingTipContext: 'Voeg toelichting toe bij je antwoord. Dit helpt het team begrijpen wat er speelt.',
    coachingTipRetro: 'Neem dit mee naar de retro. Jouw stem telt.',
    coachingTipFeedback: 'Je Scrum Master staat open voor feedback.',
    coachingTipAnonymous: 'Je antwoord is anoniem.',

    // Invalid link
    invalidTitle: 'Link niet geldig',
    invalidMessage: 'Deze link is niet geldig of verlopen. Vraag je Scrum Master om een nieuwe link.',
    invalidTip: 'Controleer of je de volledige link hebt gekopieerd',

    // Admin
    adminTeams: 'Teams',
    adminTeamsSubtitle: 'Beheer je Delta sessies',
    adminNewTeam: 'Nieuw team',
    adminNoTeams: 'Nog geen teams',
    adminNoTeamsMessage: 'Maak je eerste team aan om te beginnen.',
    adminFirstTeam: 'Eerste team aanmaken',
    adminBack: 'Terug',
    adminCreatedOn: 'Aangemaakt',
    adminParticipants: 'leden',
    adminToday: 'vandaag',
    adminActive: 'Actief',
    adminLogout: 'Uitloggen',

    // New team form
    newTeamTitle: 'Nieuw team',
    newTeamName: 'Team naam',
    newTeamNamePlaceholder: 'bijv. Sprint Team Alpha',
    newTeamDescription: 'Beschrijving (optioneel)',
    newTeamDescriptionPlaceholder: 'Korte beschrijving',
    newTeamSize: 'Team grootte (optioneel)',
    newTeamSizePlaceholder: 'bijv. 8',
    newTeamSizeHelp: 'Voor nauwkeurige deelname %',
    newTeamCreate: 'Team aanmaken',
    newTeamCreating: 'Aanmaken...',

    // Stats
    statsTitle: 'Resultaten',
    statsToday: 'Vandaag',
    statsWeek: 'Deze week',
    statsAvgMood: 'Gem. score',
    statsCheckins: 'Reacties',
    statsParticipation: 'Deelname',
    statsNoData: 'Nog geen data',

    // Share link
    shareTitle: 'Deel link',
    shareDescription: 'Deel deze link met je team.',
    shareOpen: 'Open Delta',
    shareCopy: 'Kopieer',
    shareCopied: 'Gekopieerd!',
    shareAdvanced: 'Geavanceerd',
    shareResetTitle: 'Link resetten',
    shareResetInfo: 'Gebruik dit als de link met verkeerde mensen is gedeeld. De oude link werkt direct niet meer.',
    shareResetButton: 'Reset link',
    shareResetConfirm: 'Link resetten?',
    shareResetWarning: 'De huidige link werkt direct niet meer. Teamleden moeten de nieuwe link gebruiken.',
    shareResetCancel: 'Annuleren',
    shareResetYes: 'Ja, reset',
    shareResetSuccess: 'Nieuwe link gegenereerd',
    shareNoLink: 'Geen actieve link',

    // Team actions
    teamDelete: 'Verwijderen',
    teamDeleteConfirm: 'Weet je zeker dat je dit team wilt verwijderen?',
    teamReset: 'Data wissen',
    teamResetTitle: 'Data resetten',
    teamResetMessage: 'Alle sessie data wordt verwijderd. De toegangslink blijft werken.',
    teamResetButton: 'Wissen',
    teamDeleteTitle: 'Team verwijderen',
    teamDeleteMessage: 'Weet je zeker dat je dit team wilt verwijderen? Dit kan niet ongedaan worden.',
    teamDeleteButton: 'Verwijderen',
    teamSettings: 'Instellingen',
    teamSettingsSaved: 'Opgeslagen',

    // Stats
    statsParticipants: 'Teamleden',
    statsCheckinsToday: 'Reacties vandaag',
    statsMoodScale: 'Score schaal',
  },

  en: {
    // General
    pinkPollos: 'Pink Pollos',
    labTool: 'Agile Interventions',
    pulse: 'Delta',
    admin: 'Admin',
    error: 'Something went wrong',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    create: 'Create',

    // Homepage
    homeTitle: 'Delta',
    homeSubtitle: 'Agile Interventions',
    homeDescription: 'Time-boxed interventions for Agile teams. One focus, one experiment, one owner.',
    homeFeature1: 'Sharp',
    homeFeature2: 'Anonymous',
    homeFeature3: 'Action',
    homeAskTeamLead: 'Ask your Scrum Master for a Delta link',
    homeFooter: 'Agile Interventions',
    homeScrumMasterCTA: "I'm a Scrum Master",
    homeScrumMasterSubtext: 'Start in 30 seconds',
    homeAlreadyAccount: 'Already have an account?',
    homeAdminLogin: 'Admin login',
    homeLabAccess: 'Access',

    // Login
    loginWelcome: 'Welcome to Delta',
    loginSubtitle: 'Enter your email for access',
    loginEmail: 'Email',
    loginEmailPlaceholder: 'your@email.com',
    loginButton: 'Send link',
    loginLoading: 'Loading...',
    loginNoPassword: 'No password needed.',
    loginCheckInbox: 'Check your inbox',
    loginEmailSent: "We've sent a login link to",
    loginClickLink: 'Click the link in the email to log in.',
    loginOtherEmail: 'Different email?',
    loginUnauthorized: "Your email isn't in the admin list.",
    loginForgotPassword: '',
    loginAdminAccess: 'Admin',

    // Team signal input (Delta sessions)
    checkinQuestion: 'Rate this statement',
    checkinToday: 'today',
    checkinName: 'Alias (optional)',
    checkinComment: 'Comment (optional)',
    checkinButton: 'Submit',
    checkinLoading: 'Processing...',
    checkinAnonymous: 'Fully anonymous',

    // Signal levels (1-5 scale)
    moodVeryBad: '1',
    moodBad: '2',
    moodOkay: '3',
    moodGood: '4',
    moodGreat: '5',

    // Success
    successTitle: 'Response received',
    successRecorded: 'Your input has been recorded',
    successStreak: 'sessions completed',
    successStreakSingular: 'session completed',
    successKeepGoing: 'Great work!',
    successFirstCheckin: 'Your first response is in',
    successOnFire: 'Top contributor!',
    successTopPerformer: 'Top contributor',
    successTeamToday: 'Team today',
    successAverage: 'average',
    successCheckins: 'responses',
    successSeeYouTomorrow: 'Thank you for your input.',

    // Already submitted
    alreadyTitle: 'Already submitted',
    alreadyMessage: 'You have already completed this session.',
    alreadyCheckedToday: 'responses today',

    // Coaching tips
    coachingTipTitle: 'Tip',
    coachingTipLow: 'Low score? Discuss it in the retro or with your Scrum Master.',
    coachingTipContext: 'Add a comment to your response. It helps the team understand the context.',
    coachingTipRetro: 'Bring this to the retro. Your voice matters.',
    coachingTipFeedback: 'Your Scrum Master is open to feedback.',
    coachingTipAnonymous: 'Your response is anonymous.',

    // Invalid link
    invalidTitle: 'Invalid link',
    invalidMessage: 'This link is invalid or expired. Ask your Scrum Master for a new link.',
    invalidTip: 'Make sure you copied the full link',

    // Admin
    adminTeams: 'Teams',
    adminTeamsSubtitle: 'Manage your Delta sessions',
    adminNewTeam: 'New team',
    adminNoTeams: 'No teams yet',
    adminNoTeamsMessage: 'Create your first team to get started.',
    adminFirstTeam: 'Create first team',
    adminBack: 'Back',
    adminCreatedOn: 'Created',
    adminParticipants: 'members',
    adminToday: 'today',
    adminActive: 'Active',
    adminLogout: 'Log out',

    // New team form
    newTeamTitle: 'New team',
    newTeamName: 'Team name',
    newTeamNamePlaceholder: 'e.g. Sprint Team Alpha',
    newTeamDescription: 'Description (optional)',
    newTeamDescriptionPlaceholder: 'Short description',
    newTeamSize: 'Team size (optional)',
    newTeamSizePlaceholder: 'e.g. 8',
    newTeamSizeHelp: 'For accurate participation %',
    newTeamCreate: 'Create team',
    newTeamCreating: 'Creating...',

    // Stats
    statsTitle: 'Results',
    statsToday: 'Today',
    statsWeek: 'This week',
    statsAvgMood: 'Avg. score',
    statsCheckins: 'Responses',
    statsParticipation: 'Participation',
    statsNoData: 'No data yet',

    // Share link
    shareTitle: 'Share link',
    shareDescription: 'Share this link with your team.',
    shareOpen: 'Open Delta',
    shareCopy: 'Copy',
    shareCopied: 'Copied!',
    shareAdvanced: 'Advanced',
    shareResetTitle: 'Reset link',
    shareResetInfo: 'Use this if the link was shared with the wrong people. The old link will stop working immediately.',
    shareResetButton: 'Reset link',
    shareResetConfirm: 'Reset link?',
    shareResetWarning: 'The current link will stop working immediately. Team members will need to use the new link.',
    shareResetCancel: 'Cancel',
    shareResetYes: 'Yes, reset',
    shareResetSuccess: 'New link generated',
    shareNoLink: 'No active link',

    // Team actions
    teamDelete: 'Delete',
    teamDeleteConfirm: 'Are you sure you want to delete this team?',
    teamReset: 'Clear data',
    teamResetTitle: 'Reset data',
    teamResetMessage: 'All session data will be removed. The access link will keep working.',
    teamResetButton: 'Clear',
    teamDeleteTitle: 'Delete team',
    teamDeleteMessage: 'Are you sure you want to delete this team? This cannot be undone.',
    teamDeleteButton: 'Delete',
    teamSettings: 'Settings',
    teamSettingsSaved: 'Saved',

    // Stats
    statsParticipants: 'Team members',
    statsCheckinsToday: 'Responses today',
    statsMoodScale: 'Score scale',
  },
} as const

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.nl
