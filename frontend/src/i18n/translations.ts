export type Language = 'en' | 'es' | 'fr';

export const languageNames: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

type Dictionary = Record<string, string>;

const en: Dictionary = {
  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.checking': 'Checking',
  'nav.savings': 'Savings',
  'nav.transfers': 'Transfers',
  'nav.bills': 'Pay Bills / P2P',
  'nav.cards': 'Cards',
  'nav.transactions': 'Transactions',
  'nav.deposit': 'Deposit',
  'nav.loans': 'Loans',
  'nav.settings': 'Settings',
  'nav.support': 'Support',
  'nav.adminPortal': 'Admin portal',
  'nav.signOut': 'Sign out',
  'nav.banking': 'Banking',
  'nav.member': 'Member',

  // Common actions
  'common.continue': 'Continue',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm & send',
  'common.edit': 'Edit details',
  'common.save': 'Save',
  'common.close': 'Close',
  'common.loading': 'Loading…',
  'common.send': 'Send',
  'common.back': 'Back',
  'common.amount': 'Amount',
  'common.description': 'Description',
  'common.category': 'Category',
  'common.date': 'Date',
  'common.status': 'Status',
  'common.recipient': 'Recipient',

  // Auth
  'auth.welcomeBack': 'Welcome back',
  'auth.signInSubtitle': 'Sign in to your Harborlight account.',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.signIn': 'Sign in',
  'auth.newToHarborlight': 'New to Harborlight?',
  'auth.openAccount': 'Open an account',

  // Transfers
  'transfer.title': 'Send money',
  'transfer.internal': 'Internal transfer',
  'transfer.internalDesc': 'Send to another Harborlight member instantly.',
  'transfer.interAccount': 'Inter-account transfer',
  'transfer.interAccountDesc': 'Move money between your own checking and savings.',
  'transfer.local': 'Local transfer',
  'transfer.localDesc': 'Send to a domestic bank account.',
  'transfer.international': 'International transfer',
  'transfer.internationalDesc': 'Wire to a bank account abroad using SWIFT/BIC.',
  'transfer.reviewTitle': 'Review your transfer',
  'transfer.reviewSubtitle': "Please confirm these details before we send it - you won't be able to change them after this.",

  // Notifications
  'notifications.title': 'Notifications',
  'notifications.empty': "You're all caught up.",
  'notifications.markSeen': 'Mark all as read',

  // Theme
  'theme.light': 'Light mode',
  'theme.dark': 'Dark mode',

  // Language
  'language.choose': 'Language',
};

const es: Dictionary = {
  'nav.dashboard': 'Panel',
  'nav.checking': 'Cuenta corriente',
  'nav.savings': 'Ahorros',
  'nav.transfers': 'Transferencias',
  'nav.bills': 'Pagar facturas / P2P',
  'nav.cards': 'Tarjetas',
  'nav.transactions': 'Transacciones',
  'nav.deposit': 'Depósito',
  'nav.loans': 'Préstamos',
  'nav.settings': 'Configuración',
  'nav.support': 'Soporte',
  'nav.adminPortal': 'Portal de administración',
  'nav.signOut': 'Cerrar sesión',
  'nav.banking': 'Banca',
  'nav.member': 'Miembro',

  'common.continue': 'Continuar',
  'common.cancel': 'Cancelar',
  'common.confirm': 'Confirmar y enviar',
  'common.edit': 'Editar detalles',
  'common.save': 'Guardar',
  'common.close': 'Cerrar',
  'common.loading': 'Cargando…',
  'common.send': 'Enviar',
  'common.back': 'Atrás',
  'common.amount': 'Monto',
  'common.description': 'Descripción',
  'common.category': 'Categoría',
  'common.date': 'Fecha',
  'common.status': 'Estado',
  'common.recipient': 'Destinatario',

  'auth.welcomeBack': 'Bienvenido de nuevo',
  'auth.signInSubtitle': 'Inicia sesión en tu cuenta de Harborlight.',
  'auth.email': 'Correo electrónico',
  'auth.password': 'Contraseña',
  'auth.signIn': 'Iniciar sesión',
  'auth.newToHarborlight': '¿Nuevo en Harborlight?',
  'auth.openAccount': 'Abrir una cuenta',

  'transfer.title': 'Enviar dinero',
  'transfer.internal': 'Transferencia interna',
  'transfer.internalDesc': 'Envía a otro miembro de Harborlight al instante.',
  'transfer.interAccount': 'Transferencia entre cuentas',
  'transfer.interAccountDesc': 'Mueve dinero entre tu cuenta corriente y de ahorros.',
  'transfer.local': 'Transferencia local',
  'transfer.localDesc': 'Envía a una cuenta bancaria nacional.',
  'transfer.international': 'Transferencia internacional',
  'transfer.internationalDesc': 'Transfiere a una cuenta bancaria en el extranjero usando SWIFT/BIC.',
  'transfer.reviewTitle': 'Revisa tu transferencia',
  'transfer.reviewSubtitle': 'Confirma estos detalles antes de enviarlo - no podrás cambiarlos después.',

  'notifications.title': 'Notificaciones',
  'notifications.empty': 'Estás al día.',
  'notifications.markSeen': 'Marcar todo como leído',

  'theme.light': 'Modo claro',
  'theme.dark': 'Modo oscuro',

  'language.choose': 'Idioma',
};

const fr: Dictionary = {
  'nav.dashboard': 'Tableau de bord',
  'nav.checking': 'Compte courant',
  'nav.savings': 'Épargne',
  'nav.transfers': 'Virements',
  'nav.bills': 'Payer des factures / P2P',
  'nav.cards': 'Cartes',
  'nav.transactions': 'Transactions',
  'nav.deposit': 'Dépôt',
  'nav.loans': 'Prêts',
  'nav.settings': 'Paramètres',
  'nav.support': 'Assistance',
  'nav.adminPortal': "Portail d'administration",
  'nav.signOut': 'Se déconnecter',
  'nav.banking': 'Banque',
  'nav.member': 'Membre',

  'common.continue': 'Continuer',
  'common.cancel': 'Annuler',
  'common.confirm': 'Confirmer et envoyer',
  'common.edit': 'Modifier les détails',
  'common.save': 'Enregistrer',
  'common.close': 'Fermer',
  'common.loading': 'Chargement…',
  'common.send': 'Envoyer',
  'common.back': 'Retour',
  'common.amount': 'Montant',
  'common.description': 'Description',
  'common.category': 'Catégorie',
  'common.date': 'Date',
  'common.status': 'Statut',
  'common.recipient': 'Destinataire',

  'auth.welcomeBack': 'Content de vous revoir',
  'auth.signInSubtitle': 'Connectez-vous à votre compte Harborlight.',
  'auth.email': 'E-mail',
  'auth.password': 'Mot de passe',
  'auth.signIn': 'Se connecter',
  'auth.newToHarborlight': 'Nouveau chez Harborlight ?',
  'auth.openAccount': 'Ouvrir un compte',

  'transfer.title': 'Envoyer de l argent',
  'transfer.internal': 'Virement interne',
  'transfer.internalDesc': 'Envoyez à un autre membre de Harborlight instantanément.',
  'transfer.interAccount': 'Virement entre comptes',
  'transfer.interAccountDesc': 'Déplacez de l argent entre votre compte courant et votre épargne.',
  'transfer.local': 'Virement local',
  'transfer.localDesc': 'Envoyez vers un compte bancaire national.',
  'transfer.international': 'Virement international',
  'transfer.internationalDesc': 'Virement vers un compte bancaire à l étranger via SWIFT/BIC.',
  'transfer.reviewTitle': 'Vérifiez votre virement',
  'transfer.reviewSubtitle': 'Veuillez confirmer ces détails avant l envoi - vous ne pourrez plus les modifier après.',

  'notifications.title': 'Notifications',
  'notifications.empty': 'Vous êtes à jour.',
  'notifications.markSeen': 'Tout marquer comme lu',

  'theme.light': 'Mode clair',
  'theme.dark': 'Mode sombre',

  'language.choose': 'Langue',
};

export const translations: Record<Language, Dictionary> = { en, es, fr };
