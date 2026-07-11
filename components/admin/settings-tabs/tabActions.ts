// components/admin/settings-tabs/tabActions.ts
// Defines all granular actions for each admin tab
// Used by TeamMemberModal to show per-tab action permissions

export interface TabAction {
  key:      string
  label:    string
  risk:     'low' | 'medium' | 'high'
  desc:     string
}

export const TAB_ACTIONS: Record<string, TabAction[]> = {

  user_crm: [
    { key: 'view_list',        label: 'View user list',          risk: 'low',    desc: 'Browse and search all users'             },
    { key: 'filter_search',    label: 'Filter & search users',   risk: 'low',    desc: 'Apply filters by plan, country, status'  },
    { key: 'view_profile',     label: 'View user profile',       risk: 'low',    desc: 'See full user profile details'           },
    { key: 'edit_details',     label: 'Edit user details',       risk: 'medium', desc: 'Edit name, email and other details'      },
    { key: 'change_plan',      label: 'Change user plan',        risk: 'high',   desc: 'Upgrade or downgrade a user plan'        },
    { key: 'change_status',    label: 'Change user status',      risk: 'high',   desc: 'Set user to active or inactive'          },
    { key: 'suspend_user',     label: 'Suspend / unsuspend user',risk: 'high',   desc: 'Block or restore user access'            },
    { key: 'export_csv',       label: 'Export users CSV',        risk: 'medium', desc: 'Download all user data as CSV'           },
    { key: 'create_user',      label: 'Create new user',         risk: 'high',   desc: 'Manually create a new user account'     },
    { key: 'bulk_change_plan', label: 'Bulk change plan',        risk: 'high',   desc: 'Change plan for multiple users at once' },
    { key: 'email_expiring',   label: 'Email expiring users',    risk: 'medium', desc: 'Send emails to users with expiring plans'},
  ],

  role_builder: [
    { key: 'view_roles',       label: 'View roles list',         risk: 'low',    desc: 'See all admin roles'                    },
    { key: 'create_role',      label: 'Create new role',         risk: 'high',   desc: 'Add a new admin role'                   },
    { key: 'edit_role',        label: 'Edit role permissions',   risk: 'high',   desc: 'Change what a role can access'          },
    { key: 'delete_role',      label: 'Delete role',             risk: 'high',   desc: 'Permanently remove a role'              },
    { key: 'manage_team',      label: 'Manage team members',     risk: 'high',   desc: 'Assign roles and permissions to admins' },
  ],

  security_logs: [
    { key: 'view_logs',        label: 'View security logs',      risk: 'low',    desc: 'Browse all security events'             },
    { key: 'export_logs',      label: 'Export logs',             risk: 'medium', desc: 'Download security logs as CSV'          },
    { key: 'clear_logs',       label: 'Clear logs',              risk: 'high',   desc: 'Permanently delete security logs'       },
  ],

  promos: [
    { key: 'view_promos',      label: 'View promos list',        risk: 'low',    desc: 'See all promo codes'                    },
    { key: 'create_promo',     label: 'Create promo code',       risk: 'medium', desc: 'Add a new promo code'                   },
    { key: 'edit_promo',       label: 'Edit promo code',         risk: 'medium', desc: 'Modify existing promo codes'            },
    { key: 'delete_promo',     label: 'Delete promo code',       risk: 'high',   desc: 'Permanently remove a promo'             },
    { key: 'toggle_promo',     label: 'Toggle promo on/off',     risk: 'medium', desc: 'Enable or disable a promo code'         },
    { key: 'view_analytics',   label: 'View promo analytics',    risk: 'low',    desc: 'See usage stats for promo codes'        },
  ],

  kill_switches: [
    { key: 'view_switches',    label: 'View kill switches',      risk: 'low',    desc: 'See all feature kill switches'          },
    { key: 'toggle_switch',    label: 'Toggle kill switch',      risk: 'high',   desc: 'Enable or disable a feature globally'   },
  ],

  plan_limits: [
    { key: 'view_limits',      label: 'View plan limits',        risk: 'low',    desc: 'See limits for each plan'               },
    { key: 'edit_limits',      label: 'Edit plan limits',        risk: 'high',   desc: 'Change feature limits per plan'         },
  ],

  emails: [
    { key: 'view_templates',   label: 'View email templates',    risk: 'low',    desc: 'See all email templates'                },
    { key: 'edit_templates',   label: 'Edit email templates',    risk: 'medium', desc: 'Modify email content and subject'       },
    { key: 'view_logs',        label: 'View email logs',         risk: 'low',    desc: 'See sent email history'                 },
    { key: 'send_test',        label: 'Send test email',         risk: 'medium', desc: 'Send a test email to any address'       },
    { key: 'manage_flows',     label: 'Manage email flows',      risk: 'high',   desc: 'Edit automated email sequences'         },
  ],

  webhooks: [
    { key: 'view_webhooks',    label: 'View webhooks',           risk: 'low',    desc: 'See all configured webhooks'            },
    { key: 'create_webhook',   label: 'Create webhook',          risk: 'medium', desc: 'Add a new webhook endpoint'             },
    { key: 'edit_webhook',     label: 'Edit webhook',            risk: 'medium', desc: 'Modify webhook settings'                },
    { key: 'delete_webhook',   label: 'Delete webhook',          risk: 'high',   desc: 'Permanently remove a webhook'           },
    { key: 'test_webhook',     label: 'Test webhook',            risk: 'low',    desc: 'Send a test payload to a webhook'       },
  ],

  gamification: [
    { key: 'view_quests',      label: 'View quests & rewards',   risk: 'low',    desc: 'See all quests and reward configs'      },
    { key: 'create_quest',     label: 'Create quest',            risk: 'medium', desc: 'Add a new quest or challenge'           },
    { key: 'edit_quest',       label: 'Edit quest',              risk: 'medium', desc: 'Modify quest details and rewards'       },
    { key: 'delete_quest',     label: 'Delete quest',            risk: 'high',   desc: 'Permanently remove a quest'             },
    { key: 'fulfill_reward',   label: 'Fulfill reward manually', risk: 'medium', desc: 'Manually grant a reward to a user'      },
    { key: 'rebuild_leaderboard', label: 'Rebuild leaderboard', risk: 'medium', desc: 'Recalculate leaderboard rankings'        },
  ],

  api_vault: [
    { key: 'view_keys',        label: 'View API keys',           risk: 'low',    desc: 'See configured API keys (masked)'       },
    { key: 'create_key',       label: 'Create API key',          risk: 'high',   desc: 'Add a new API key'                      },
    { key: 'delete_key',       label: 'Delete API key',          risk: 'high',   desc: 'Permanently remove an API key'          },
    { key: 'reset_key',        label: 'Reset API key',           risk: 'high',   desc: 'Regenerate an existing API key'         },
  ],

  affiliate_vault: [
    { key: 'view_affiliates',  label: 'View affiliates',         risk: 'low',    desc: 'See all affiliate accounts'             },
    { key: 'approve_affiliate',label: 'Approve affiliate',       risk: 'medium', desc: 'Approve pending affiliate applications' },
    { key: 'edit_commission',  label: 'Edit commission rate',    risk: 'high',   desc: 'Change commission % for an affiliate'   },
    { key: 'view_payouts',     label: 'View payouts',            risk: 'low',    desc: 'See affiliate payout history'           },
    { key: 'export_affiliates',label: 'Export affiliates',       risk: 'medium', desc: 'Download affiliate data as CSV'         },
  ],

  founder_ops: [
    { key: 'view_revenue',     label: 'View revenue stats',      risk: 'low',    desc: 'See MRR, ARR and revenue metrics'       },
    { key: 'view_mrr',         label: 'View MRR dashboard',      risk: 'low',    desc: 'See monthly recurring revenue details'  },
    { key: 'export_financial', label: 'Export financial data',   risk: 'high',   desc: 'Download revenue and financial reports' },
  ],

  marketing: [
    { key: 'view_campaigns',   label: 'View campaigns',          risk: 'low',    desc: 'See all marketing campaigns'            },
    { key: 'create_campaign',  label: 'Create campaign',         risk: 'medium', desc: 'Add a new marketing campaign'           },
    { key: 'edit_campaign',    label: 'Edit campaign',           risk: 'medium', desc: 'Modify campaign content and settings'   },
    { key: 'delete_campaign',  label: 'Delete campaign',         risk: 'high',   desc: 'Permanently remove a campaign'          },
    { key: 'send_broadcast',   label: 'Send broadcast',          risk: 'high',   desc: 'Send a message to all or selected users'},
  ],

  payments: [
    { key: 'view_payments',    label: 'View payments list',      risk: 'low',    desc: 'See all payment transactions'           },
    { key: 'view_subscription',label: 'View subscription details',risk: 'low',  desc: 'See user subscription information'      },
    { key: 'issue_refund',     label: 'Issue refund',            risk: 'high',   desc: 'Refund a payment to a user'             },
    { key: 'cancel_subscription',label: 'Cancel subscription',   risk: 'high',   desc: 'Cancel a user subscription'            },
    { key: 'export_payments',  label: 'Export payments',         risk: 'medium', desc: 'Download payment data as CSV'           },
  ],

  tickets: [
    { key: 'view_tickets',     label: 'View tickets',            risk: 'low',    desc: 'See all support tickets'                },
    { key: 'reply_ticket',     label: 'Reply to ticket',         risk: 'low',    desc: 'Send a reply to a support ticket'       },
    { key: 'change_status',    label: 'Change ticket status',    risk: 'medium', desc: 'Update ticket status and priority'      },
    { key: 'delete_ticket',    label: 'Delete ticket',           risk: 'high',   desc: 'Permanently remove a ticket'            },
    { key: 'export_tickets',   label: 'Export tickets',          risk: 'medium', desc: 'Download ticket data as CSV'            },
  ],

  blog: [
    { key: 'view_posts',       label: 'View posts',              risk: 'low',    desc: 'See all blog posts'                     },
    { key: 'create_post',      label: 'Create post',             risk: 'medium', desc: 'Write a new blog post'                  },
    { key: 'edit_post',        label: 'Edit post',               risk: 'medium', desc: 'Modify existing blog posts'             },
    { key: 'delete_post',      label: 'Delete post',             risk: 'high',   desc: 'Permanently remove a blog post'         },
    { key: 'publish_post',     label: 'Publish / unpublish',     risk: 'medium', desc: 'Make a post live or take it offline'    },
  ],

  changelog: [
    { key: 'view_entries',     label: 'View changelog',          risk: 'low',    desc: 'See all changelog entries'              },
    { key: 'create_entry',     label: 'Create entry',            risk: 'medium', desc: 'Add a new changelog entry'              },
    { key: 'edit_entry',       label: 'Edit entry',              risk: 'medium', desc: 'Modify existing changelog entries'      },
    { key: 'delete_entry',     label: 'Delete entry',            risk: 'high',   desc: 'Permanently remove a changelog entry'   },
    { key: 'publish_entry',    label: 'Publish entry',           risk: 'medium', desc: 'Make an entry visible to users'         },
  ],

  careers: [
    { key: 'view_jobs',        label: 'View job postings',       risk: 'low',    desc: 'See all job postings'                   },
    { key: 'create_job',       label: 'Create job posting',      risk: 'medium', desc: 'Add a new job posting'                  },
    { key: 'edit_job',         label: 'Edit job posting',        risk: 'medium', desc: 'Modify existing job postings'           },
    { key: 'delete_job',       label: 'Delete job posting',      risk: 'high',   desc: 'Permanently remove a job posting'       },
    { key: 'publish_job',      label: 'Publish / unpublish job', risk: 'medium', desc: 'Make a job posting live or offline'     },
    { key: 'view_applications',label: 'View applications',       risk: 'low',    desc: 'See all job applications'               },
    { key: 'change_app_status',label: 'Change application status',risk: 'medium',desc: 'Update applicant status'                },
    { key: 'delete_application',label: 'Delete application',     risk: 'high',   desc: 'Permanently remove an application'      },
    { key: 'run_ai_screening', label: 'Run AI screening',        risk: 'low',    desc: 'Screen applications with AI scorer'     },
    { key: 'send_email',       label: 'Send email to applicant', risk: 'medium', desc: 'Send email templates to applicants'     },
    { key: 'add_notes',        label: 'Add / edit notes',        risk: 'low',    desc: 'Add private notes on applications'      },
  ],

  page_editor: [
    { key: 'view_pages',       label: 'View pages',              risk: 'low',    desc: 'See all editable pages'                 },
    { key: 'edit_content',     label: 'Edit page content',       risk: 'medium', desc: 'Modify page text and content'           },
    { key: 'publish_changes',  label: 'Publish changes',         risk: 'high',   desc: 'Make page changes live'                 },
  ],

}

// Analytics Hub tabs
export const ANALYTICS_TABS = [
  { key: 'api_fleet',        label: 'API Fleet'              },
  { key: 'feature_roadmap',  label: 'Feature Roadmap'        },
  { key: 'vero_center',      label: 'VeRO Command Center'    },
  { key: 'infra_monitor',    label: 'Infrastructure Monitor' },
  { key: 'competitor_xray',  label: 'Competitor X-Ray'       },
  { key: 'chrome_extension', label: 'Chrome Extension'       },
]