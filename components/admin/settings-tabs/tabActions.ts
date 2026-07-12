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
    { key: 'add_notes',        label: 'Add / edit notes',        risk: 'low',    desc: 'Write private notes on user profiles'   },
    { key: 'view_security',    label: 'View IP & login logs',    risk: 'low',    desc: 'See user security and login history'    },
    { key: 'impersonate_user', label: 'Impersonate user',        risk: 'high',   desc: 'Log in as the user to debug issues'     },
    { key: 'delete_user',      label: 'Delete user account',     risk: 'high',   desc: 'Permanently delete a user and all data' },
    { key: 'force_logout',     label: 'Force logout user',       risk: 'medium', desc: 'Immediately end user session'           },
    { key: 'manage_tags',      label: 'Manage user tags',        risk: 'medium', desc: 'Add or remove tags from user profiles'  },
  ],

  role_builder: [
    { key: 'view_roles',       label: 'View roles list',         risk: 'low',    desc: 'See all admin roles'                    },
    { key: 'create_role',      label: 'Create new role',         risk: 'high',   desc: 'Add a new admin role'                   },
    { key: 'edit_role',        label: 'Edit role permissions',   risk: 'high',   desc: 'Change what a role can access'          },
    { key: 'delete_role',      label: 'Delete role',             risk: 'high',   desc: 'Permanently remove a role'              },
    { key: 'view_team',        label: 'View team members',       risk: 'low',    desc: 'See all admin team seats'               },
    { key: 'invite_member',    label: 'Invite team member',      risk: 'high',   desc: 'Send invite to a new admin'             },
    { key: 'revoke_access',    label: 'Revoke member access',    risk: 'high',   desc: 'Remove admin access from a team member' },
    { key: 'manage_team',      label: 'Manage team permissions', risk: 'high',   desc: 'Assign roles and permissions to admins' },
  ],

  security_logs: [
    { key: 'view_logs',        label: 'View security logs',      risk: 'low',    desc: 'Browse all security events'             },
    { key: 'export_logs',      label: 'Export logs',             risk: 'medium', desc: 'Download security logs as CSV'          },
    { key: 'block_ip',         label: 'Block IP address',        risk: 'high',   desc: 'Add an IP to the blocked list'          },
    { key: 'unblock_ip',       label: 'Unblock IP address',      risk: 'high',   desc: 'Remove an IP from the blocked list'     },
    { key: 'lock_account',     label: 'Lock user account',       risk: 'high',   desc: 'Lock account from fraud sentinel alert' },
    { key: 'dismiss_alert',    label: 'Dismiss alerts',          risk: 'medium', desc: 'Dismiss fraud sentinel warnings'        },
    { key: 'view_blocked_ips', label: 'View blocked IPs',        risk: 'low',    desc: 'See all blocked IP addresses'           },
    { key: 'clear_logs',       label: 'Clear logs',              risk: 'high',   desc: 'Permanently delete security logs'       },
  ],

  promos: [
    { key: 'view_promos',      label: 'View promos list',        risk: 'low',    desc: 'See all promo codes'                    },
    { key: 'create_promo',     label: 'Create promo code',       risk: 'medium', desc: 'Add a new promo code'                   },
    { key: 'edit_promo',       label: 'Edit promo code',         risk: 'medium', desc: 'Modify existing promo codes'            },
    { key: 'delete_promo',     label: 'Delete promo code',       risk: 'high',   desc: 'Permanently remove a promo'             },
    { key: 'toggle_promo',     label: 'Toggle promo on/off',     risk: 'medium', desc: 'Enable or disable a promo code'         },
    { key: 'export_promos',    label: 'Export promo codes',      risk: 'low',    desc: 'Download promo codes as CSV'            },
    { key: 'view_analytics',   label: 'View promo analytics',    risk: 'low',    desc: 'See usage stats for promo codes'        },
    { key: 'create_ab_test',   label: 'Create A/B price test',   risk: 'high',   desc: 'Launch a new A/B pricing experiment'    },
    { key: 'delete_ab_test',   label: 'Delete A/B test',         risk: 'high',   desc: 'Remove an A/B pricing test'             },
    { key: 'declare_winner',   label: 'Declare A/B winner',      risk: 'high',   desc: 'Set winning variant and end the test'   },
  ],

  kill_switches: [
    { key: 'view_switches',       label: 'View kill switches',       risk: 'low',    desc: 'See all feature kill switches'          },
    { key: 'toggle_switch',       label: 'Toggle kill switch',       risk: 'high',   desc: 'Enable or disable a feature globally'   },
    { key: 'toggle_visibility',   label: 'Toggle feature visibility',risk: 'medium', desc: 'Show or hide a feature from users'      },
    { key: 'toggle_readonly',     label: 'Toggle read-only mode',    risk: 'medium', desc: 'Set a feature to read-only for users'   },
    { key: 'schedule_maintenance',label: 'Schedule maintenance',     risk: 'medium', desc: 'Schedule a future maintenance window'   },
    { key: 'kill_all',            label: 'Kill all systems',         risk: 'high',   desc: 'Disable all features simultaneously'    },
    { key: 'view_audit',          label: 'View audit trail',         risk: 'low',    desc: 'See kill switch change history'         },
    { key: 'view_history',        label: 'View full history log',    risk: 'low',    desc: 'Access complete audit log modal'        },
  ],

  plan_limits: [
    { key: 'view_limits',      label: 'View plan limits',        risk: 'low',    desc: 'See limits for each plan'               },
    { key: 'edit_limits',      label: 'Edit plan limits',        risk: 'high',   desc: 'Change feature limits per plan'         },
    { key: 'activate_plan',    label: 'Activate / deactivate plan', risk: 'high', desc: 'Enable or disable a subscription plan' },
    { key: 'edit_pricing',     label: 'Edit pricing display',    risk: 'medium', desc: 'Edit pricing shown on landing page'     },
    { key: 'export_plans',     label: 'Export plan config',      risk: 'low',    desc: 'Download plan config as CSV'            },
    { key: 'view_history',     label: 'View plan change history', risk: 'low',   desc: 'See history of plan limit changes'      },
    { key: 'edit_gating',      label: 'Edit feature gating',     risk: 'high',   desc: 'Control which features each plan gets'  },
  ],

  emails: [
    { key: 'view_templates',   label: 'View email templates',    risk: 'low',    desc: 'See all email templates'                },
    { key: 'edit_templates',   label: 'Edit email templates',    risk: 'medium', desc: 'Modify email content and subject'       },
    { key: 'view_logs',        label: 'View email logs',         risk: 'low',    desc: 'See sent email history'                 },
    { key: 'export_logs',      label: 'Export email logs',       risk: 'low',    desc: 'Download email delivery logs as CSV'    },
    { key: 'send_test',        label: 'Send test email',         risk: 'medium', desc: 'Send a test email to any address'       },
    { key: 'manage_flows',     label: 'View email flows',        risk: 'low',    desc: 'See all automated email sequences'      },
    { key: 'create_flow',      label: 'Create email flow',       risk: 'high',   desc: 'Add a new automated email sequence'     },
    { key: 'delete_flow',      label: 'Delete email flow',       risk: 'high',   desc: 'Remove an automated email sequence'     },
    { key: 'toggle_flow',      label: 'Toggle flow on/off',      risk: 'medium', desc: 'Enable or disable an email sequence'    },
    { key: 'add_step',         label: 'Add flow step',           risk: 'medium', desc: 'Add a new step to an email flow'        },
    { key: 'delete_step',      label: 'Delete flow step',        risk: 'medium', desc: 'Remove a step from an email flow'       },
    { key: 'manage_retention', label: 'Manage log retention',    risk: 'high',   desc: 'Configure email log retention settings' },
  ],

  webhooks: [
    { key: 'view_webhooks',    label: 'View webhooks',           risk: 'low',    desc: 'See all configured webhooks'            },
    { key: 'create_webhook',   label: 'Create webhook',          risk: 'medium', desc: 'Add a new webhook endpoint'             },
    { key: 'edit_webhook',     label: 'Edit webhook',            risk: 'medium', desc: 'Modify webhook settings'                },
    { key: 'delete_webhook',   label: 'Delete webhook',          risk: 'high',   desc: 'Permanently remove a webhook'           },
    { key: 'test_webhook',     label: 'Test webhook',            risk: 'low',    desc: 'Send a test payload to a webhook'       },
    { key: 'toggle_webhook',   label: 'Toggle webhook on/off',   risk: 'medium', desc: 'Enable or disable a webhook endpoint'   },
    { key: 'view_logs',        label: 'View delivery logs',      risk: 'low',    desc: 'See webhook delivery history and errors'},
    { key: 'view_events',      label: 'View event types',        risk: 'low',    desc: 'See all available webhook event types'  },
    { key: 'manage_retention', label: 'Manage log retention',    risk: 'high',   desc: 'Configure webhook log retention policy' },
  ],

  gamification: [
    { key: 'view_quests',         label: 'View quests & rewards',   risk: 'low',    desc: 'See all quests and reward configs'      },
    { key: 'create_quest',        label: 'Create quest',            risk: 'medium', desc: 'Add a new quest or challenge'           },
    { key: 'edit_quest',          label: 'Edit quest',              risk: 'medium', desc: 'Modify quest details and rewards'       },
    { key: 'delete_quest',        label: 'Delete quest',            risk: 'high',   desc: 'Permanently remove a quest'             },
    { key: 'toggle_quest',        label: 'Toggle quest on/off',     risk: 'medium', desc: 'Enable or disable a quest'              },
    { key: 'view_leaderboard',    label: 'View leaderboard',        risk: 'low',    desc: 'See current user leaderboard rankings'  },
    { key: 'rebuild_leaderboard', label: 'Rebuild leaderboard',     risk: 'medium', desc: 'Recalculate leaderboard rankings'       },
    { key: 'view_rewards',        label: 'View pending rewards',    risk: 'low',    desc: 'See pending reward fulfillment requests'},
    { key: 'fulfill_reward',      label: 'Fulfill reward manually', risk: 'medium', desc: 'Manually grant a reward to a user'      },
    { key: 'export_rewards',      label: 'Export reward history',   risk: 'low',    desc: 'Download reward fulfillment history'    },
  ],

  api_vault: [
    { key: 'view_keys',           label: 'View API keys',           risk: 'low',    desc: 'See configured API keys (masked)'       },
    { key: 'test_connection',     label: 'Test API connection',     risk: 'low',    desc: 'Run connection test on any API'         },
    { key: 'view_activity',       label: 'View API activity',       risk: 'low',    desc: 'See usage logs per API platform'        },
    { key: 'view_security',       label: 'View security settings',  risk: 'low',    desc: 'See security config per API key'        },
    { key: 'view_notifications',  label: 'View API notifications',  risk: 'low',    desc: 'See API alerts and notifications'       },
    { key: 'export_audit',        label: 'Export audit log',        risk: 'low',    desc: 'Download API activity audit log'        },
    { key: 'create_key',          label: 'Create API key',          risk: 'high',   desc: 'Add a new API key'                      },
    { key: 'revoke_key',          label: 'Revoke API key',          risk: 'high',   desc: 'Revoke access for a specific key'       },
    { key: 'reset_key',           label: 'Reset API key',           risk: 'high',   desc: 'Regenerate an existing API key'         },
    { key: 'delete_key',          label: 'Delete API key',          risk: 'high',   desc: 'Permanently remove an API key'          },
  ],

  affiliate_vault: [
    { key: 'view_affiliates',    label: 'View affiliates',          risk: 'low',    desc: 'See all affiliate accounts'             },
    { key: 'view_applications',  label: 'View applications',        risk: 'low',    desc: 'See pending affiliate applications'     },
    { key: 'approve_affiliate',  label: 'Approve affiliate',        risk: 'medium', desc: 'Approve pending affiliate applications' },
    { key: 'reject_affiliate',   label: 'Reject affiliate',         risk: 'medium', desc: 'Reject pending affiliate applications'  },
    { key: 'remove_affiliate',   label: 'Remove affiliate',         risk: 'high',   desc: 'Remove an existing affiliate account'   },
    { key: 'edit_commission',    label: 'Edit commission rate',     risk: 'high',   desc: 'Change commission % for an affiliate'   },
    { key: 'view_payouts',       label: 'View payouts',             risk: 'low',    desc: 'See affiliate payout history'           },
    { key: 'approve_withdrawal', label: 'Approve withdrawal',       risk: 'high',   desc: 'Approve affiliate payout request'       },
    { key: 'reject_withdrawal',  label: 'Reject withdrawal',        risk: 'high',   desc: 'Reject affiliate payout request'        },
    { key: 'export_affiliates',  label: 'Export affiliates',        risk: 'medium', desc: 'Download affiliate data as CSV'         },
    { key: 'view_settings',      label: 'View affiliate settings',  risk: 'low',    desc: 'See affiliate program configuration'    },
    { key: 'edit_settings',      label: 'Edit affiliate settings',  risk: 'high',   desc: 'Change commission defaults and rules'   },
  ],

  founder_ops: [
    { key: 'view_revenue',      label: 'View revenue stats',      risk: 'low',    desc: 'See MRR, ARR and revenue metrics'       },
    { key: 'view_mrr',          label: 'View MRR dashboard',      risk: 'low',    desc: 'See monthly recurring revenue details'  },
    { key: 'export_financial',  label: 'Export financial data',   risk: 'high',   desc: 'Download revenue and financial reports' },
    { key: 'view_checklist',    label: 'View ops checklist',      risk: 'low',    desc: 'See founder operations task checklist'  },
    { key: 'complete_task',     label: 'Complete checklist task', risk: 'medium', desc: 'Mark checklist items as done'           },
    { key: 'view_vitals',       label: 'View platform vitals',    risk: 'low',    desc: 'See platform health and performance'    },
    { key: 'view_tools',        label: 'View tool usage stats',   risk: 'low',    desc: 'See tool usage breakdown and analytics' },
    { key: 'toggle_maintenance',label: 'Toggle maintenance mode', risk: 'high',   desc: 'Enable or disable platform maintenance' },
  ],

  marketing: [
    { key: 'view_campaigns',     label: 'View campaigns',          risk: 'low',    desc: 'See all marketing campaigns'            },
    { key: 'create_campaign',    label: 'Create campaign',         risk: 'medium', desc: 'Add a new marketing campaign'           },
    { key: 'edit_campaign',      label: 'Edit campaign',           risk: 'medium', desc: 'Modify campaign content and settings'   },
    { key: 'delete_campaign',    label: 'Delete campaign',         risk: 'high',   desc: 'Permanently remove a campaign'          },
    { key: 'send_broadcast',     label: 'Send broadcast',          risk: 'high',   desc: 'Send a message to all or selected users'},
    { key: 'send_test_email',    label: 'Send test email',         risk: 'medium', desc: 'Send a test email before launching'     },
    { key: 'view_audience',      label: 'View audience builder',   risk: 'low',    desc: 'See user segments and audience data'    },
    { key: 'view_history',       label: 'View campaign history',   risk: 'low',    desc: 'See all past campaign send history'     },
    { key: 'view_analytics',     label: 'View campaign analytics', risk: 'low',    desc: 'See open rates, click rates and stats'  },
    { key: 'manage_suppressed',  label: 'Manage suppressed emails',risk: 'medium', desc: 'View and manage unsubscribed emails'    },
    { key: 'view_ab_tests',      label: 'View A/B tests',          risk: 'low',    desc: 'See email A/B test results'             },
  ],

  payments: [
    { key: 'view_payments',       label: 'View payments list',      risk: 'low',    desc: 'See all payment transactions'           },
    { key: 'view_subscription',   label: 'View subscription details',risk: 'low',  desc: 'See user subscription information'      },
    { key: 'view_revenue_chart',  label: 'View revenue chart',      risk: 'low',    desc: 'See MRR trend and revenue analytics'    },
    { key: 'view_ltv',            label: 'View lifetime value',      risk: 'low',    desc: 'See LTV per user in transaction ledger' },
    { key: 'issue_refund',        label: 'Issue refund',            risk: 'high',   desc: 'Refund a payment to a user'             },
    { key: 'retry_payment',       label: 'Retry failed payment',    risk: 'high',   desc: 'Retry a failed payment transaction'     },
    { key: 'cancel_subscription', label: 'Cancel subscription',     risk: 'high',   desc: 'Cancel a user subscription'             },
    { key: 'change_billing_cycle',label: 'Change billing cycle',    risk: 'high',   desc: 'Switch user between monthly and annual' },
    { key: 'apply_coupon',        label: 'Apply promo coupon',      risk: 'medium', desc: 'Apply a discount coupon to subscription'},
    { key: 'export_payments',     label: 'Export payments',         risk: 'medium', desc: 'Download payment data as CSV'           },
  ],

  tickets: [
    { key: 'view_tickets',       label: 'View tickets',            risk: 'low',    desc: 'See all support tickets'                },
    { key: 'filter_tickets',     label: 'Filter & search tickets', risk: 'low',    desc: 'Filter tickets by status, type, priority'},
    { key: 'reply_ticket',       label: 'Reply to ticket',         risk: 'low',    desc: 'Send a reply to a support ticket'       },
    { key: 'add_internal_note',  label: 'Add internal note',       risk: 'low',    desc: 'Add private note visible only to admins'},
    { key: 'change_status',      label: 'Change ticket status',    risk: 'medium', desc: 'Update ticket status and priority'      },
    { key: 'assign_ticket',      label: 'Assign ticket',           risk: 'medium', desc: 'Assign ticket to a team member'         },
    { key: 'view_analytics',     label: 'View ticket analytics',   risk: 'low',    desc: 'See ticket stats and response times'    },
    { key: 'export_tickets',     label: 'Export tickets',          risk: 'medium', desc: 'Download ticket data as CSV'            },
    { key: 'clean_old_tickets',  label: 'Clean old tickets',       risk: 'high',   desc: 'Delete old resolved tickets in bulk'    },
    { key: 'delete_ticket',      label: 'Delete ticket',           risk: 'high',   desc: 'Permanently remove a ticket'            },
  ],

  blog: [
    { key: 'view_posts',         label: 'View posts',              risk: 'low',    desc: 'See all blog posts'                     },
    { key: 'create_post',        label: 'Create post',             risk: 'medium', desc: 'Write a new blog post'                  },
    { key: 'from_template',      label: 'Create from template',    risk: 'medium', desc: 'Start a new post from a blog template'  },
    { key: 'edit_post',          label: 'Edit post',               risk: 'medium', desc: 'Modify existing blog posts'             },
    { key: 'schedule_post',      label: 'Schedule post',           risk: 'medium', desc: 'Set a future publish date for a post'   },
    { key: 'publish_post',       label: 'Publish / unpublish',     risk: 'medium', desc: 'Make a post live or take it offline'    },
    { key: 'bulk_publish',       label: 'Bulk publish posts',      risk: 'medium', desc: 'Publish or unpublish multiple posts'    },
    { key: 'bulk_delete',        label: 'Bulk delete posts',       risk: 'high',   desc: 'Delete multiple blog posts at once'     },
    { key: 'manage_templates',   label: 'Manage templates',        risk: 'medium', desc: 'Create and edit blog post templates'    },
    { key: 'view_analytics',     label: 'View post analytics',     risk: 'low',    desc: 'See post views and engagement stats'    },
    { key: 'delete_post',        label: 'Delete post',             risk: 'high',   desc: 'Permanently remove a blog post'         },
  ],

  changelog: [
    { key: 'view_entries',     label: 'View changelog',          risk: 'low',    desc: 'See all changelog entries'              },
    { key: 'filter_entries',   label: 'Filter entries',          risk: 'low',    desc: 'Filter by version, type or date'        },
    { key: 'create_entry',     label: 'Create entry',            risk: 'medium', desc: 'Add a new changelog entry'              },
    { key: 'edit_entry',       label: 'Edit entry',              risk: 'medium', desc: 'Modify existing changelog entries'      },
    { key: 'publish_entry',    label: 'Publish entry',           risk: 'medium', desc: 'Make an entry visible to users'         },
    { key: 'bulk_publish',     label: 'Bulk publish entries',    risk: 'medium', desc: 'Publish all selected entries at once'   },
    { key: 'reset_votes',      label: 'Reset entry votes',       risk: 'medium', desc: 'Reset user votes on a changelog entry'  },
    { key: 'bulk_delete',      label: 'Bulk delete entries',     risk: 'high',   desc: 'Delete multiple entries at once'        },
    { key: 'delete_entry',     label: 'Delete entry',            risk: 'high',   desc: 'Permanently remove a changelog entry'   },
  ],

  careers: [
    { key: 'view_jobs',          label: 'View job postings',       risk: 'low',    desc: 'See all job postings'                   },
    { key: 'create_job',         label: 'Create job posting',      risk: 'medium', desc: 'Add a new job posting'                  },
    { key: 'edit_job',           label: 'Edit job posting',        risk: 'medium', desc: 'Modify existing job postings'           },
    { key: 'delete_job',         label: 'Delete job posting',      risk: 'high',   desc: 'Permanently remove a job posting'       },
    { key: 'publish_job',        label: 'Publish / unpublish job', risk: 'medium', desc: 'Make a job posting live or offline'     },
    { key: 'view_applications',  label: 'View applications',       risk: 'low',    desc: 'See all job applications'               },
    { key: 'filter_applications',label: 'Filter applications',     risk: 'low',    desc: 'Filter by status, score or job posting' },
    { key: 'change_app_status',  label: 'Change application status',risk: 'medium',desc: 'Update applicant status'                },
    { key: 'run_ai_screening',   label: 'Run AI screening',        risk: 'low',    desc: 'Screen applications with AI scorer'     },
    { key: 'bulk_screen',        label: 'Bulk AI screen all',      risk: 'low',    desc: 'Run AI screening on all applications'   },
    { key: 'send_email',         label: 'Send email to applicant', risk: 'medium', desc: 'Send email templates to applicants'     },
    { key: 'add_notes',          label: 'Add / edit notes',        risk: 'low',    desc: 'Add private notes on applications'      },
    { key: 'export_applications',label: 'Export applications',     risk: 'medium', desc: 'Download applications as CSV'           },
    { key: 'delete_application', label: 'Delete application',      risk: 'high',   desc: 'Permanently remove an application'      },
  ],

  page_editor: [
    { key: 'view_pages',       label: 'View pages',              risk: 'low',    desc: 'See all editable pages'                 },
    { key: 'preview_page',     label: 'Preview page',            risk: 'low',    desc: 'Preview page before publishing changes' },
    { key: 'edit_content',     label: 'Edit page content',       risk: 'medium', desc: 'Modify page text and content'           },
    { key: 'edit_seo',         label: 'Edit SEO settings',       risk: 'medium', desc: 'Edit meta title, description and tags'  },
    { key: 'manage_images',    label: 'Manage page images',      risk: 'medium', desc: 'Upload and manage images on pages'      },
    { key: 'reset_section',    label: 'Reset page section',      risk: 'medium', desc: 'Reset a section back to default content'},
    { key: 'export_changes',   label: 'Export pending changes',  risk: 'low',    desc: 'Download all pending page changes'      },
    { key: 'publish_changes',  label: 'Publish changes',         risk: 'high',   desc: 'Make page changes live for all users'   },
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

// Granular actions for Admin Settings tabs
export const SETTINGS_TAB_ACTIONS: Record<string, { key: string; label: string; risk: 'low'|'medium'|'high'; desc: string }[]> = {
  settings_brand: [
    { key: 'view_brand',        label: 'View brand settings',      risk: 'low',    desc: 'See logos, colors and brand assets'          },
    { key: 'upload_logo',       label: 'Upload logos',             risk: 'medium', desc: 'Upload and replace brand logo files'         },
    { key: 'edit_brand_name',   label: 'Edit brand name',          risk: 'medium', desc: 'Change the platform brand name'              },
    { key: 'edit_brand_color',  label: 'Edit brand color',         risk: 'medium', desc: 'Change primary brand color'                  },
    { key: 'save_brand',        label: 'Save brand config',        risk: 'high',   desc: 'Publish brand changes platform-wide'         },
  ],
  settings_general: [
    { key: 'view_general',      label: 'View general settings',    risk: 'low',    desc: 'See general platform configuration'          },
    { key: 'edit_site_name',    label: 'Edit site name & URL',     risk: 'medium', desc: 'Change site name and canonical URL'          },
    { key: 'edit_timezone',     label: 'Edit timezone & locale',   risk: 'low',    desc: 'Change platform timezone and language'       },
    { key: 'edit_maintenance',  label: 'Toggle maintenance mode',  risk: 'high',   desc: 'Enable or disable maintenance mode'          },
    { key: 'save_general',      label: 'Save general config',      risk: 'high',   desc: 'Save all general settings changes'           },
  ],
  settings_security: [
    { key: 'view_security',     label: 'View security settings',   risk: 'low',    desc: 'See security configuration'                  },
    { key: 'edit_password_policy', label: 'Edit password policy',  risk: 'high',   desc: 'Change minimum password requirements'        },
    { key: 'edit_session',      label: 'Edit session settings',    risk: 'high',   desc: 'Change session timeout and limits'           },
    { key: 'edit_2fa',          label: 'Manage 2FA settings',      risk: 'high',   desc: 'Configure two-factor authentication rules'   },
    { key: 'view_audit',        label: 'View audit trail',         risk: 'low',    desc: 'See security audit log'                      },
    { key: 'save_security',     label: 'Save security config',     risk: 'high',   desc: 'Apply all security setting changes'          },
  ],
  settings_integrations: [
    { key: 'view_integrations', label: 'View integrations',        risk: 'low',    desc: 'See connected third-party services'          },
    { key: 'connect_ebay',      label: 'Connect eBay API',         risk: 'high',   desc: 'Set up eBay OAuth API connection'            },
    { key: 'connect_stripe',    label: 'Connect Stripe / payments',risk: 'high',   desc: 'Configure payment gateway settings'          },
    { key: 'connect_resend',    label: 'Connect email provider',   risk: 'medium', desc: 'Set up Resend or SMTP email sending'         },
    { key: 'connect_webhooks',  label: 'Manage webhook endpoints', risk: 'medium', desc: 'Add or remove webhook destinations'          },
    { key: 'save_integrations', label: 'Save integration config',  risk: 'high',   desc: 'Apply all integration changes'               },
  ],
}
export const ANALYTICS_TAB_ACTIONS: Record<string, { key: string; label: string; risk: 'low'|'medium'|'high'; desc: string }[]> = {
  api_fleet: [
    { key: 'view_fleet',          label: 'View API fleet',            risk: 'low',    desc: 'See all API platform statuses'          },
    { key: 'test_connection',     label: 'Test connections',           risk: 'low',    desc: 'Run connection tests on APIs'           },
    { key: 'view_usage',          label: 'View usage breakdown',       risk: 'low',    desc: 'See tool usage stats per API platform'  },
    { key: 'view_notifications',  label: 'View API notifications',     risk: 'low',    desc: 'See API alert notifications panel'      },
    { key: 'export_log',          label: 'Export audit log',           risk: 'low',    desc: 'Export API activity log to CSV'         },
  ],
  feature_roadmap: [
    { key: 'view_roadmap',        label: 'View roadmap',               risk: 'low',    desc: 'See all feature requests'               },
    { key: 'add_feature',         label: 'Add feature request',        risk: 'medium', desc: 'Create new feature requests'            },
    { key: 'edit_feature',        label: 'Edit feature request',       risk: 'medium', desc: 'Modify feature request details'         },
    { key: 'toggle_public',       label: 'Toggle public visibility',   risk: 'medium', desc: 'Show or hide feature from public board' },
    { key: 'approve_feature',     label: 'Approve / reject',           risk: 'high',   desc: 'Approve or reject feature requests'     },
    { key: 'reset_votes',         label: 'Reset feature votes',        risk: 'medium', desc: 'Reset user votes on a feature request'  },
    { key: 'delete_feature',      label: 'Delete feature',             risk: 'high',   desc: 'Permanently remove feature requests'    },
  ],
  vero_center: [
    { key: 'view_vero',           label: 'View VeRO database',         risk: 'low',    desc: 'See all VeRO brands'                    },
    { key: 'view_reports',        label: 'View violation reports',      risk: 'low',    desc: 'See user-submitted VeRO reports'        },
    { key: 'add_brand',           label: 'Add brand',                  risk: 'medium', desc: 'Add brands to VeRO database'            },
    { key: 'import_csv',          label: 'Import brands via CSV',      risk: 'medium', desc: 'Bulk import brands from CSV file'       },
    { key: 'sync_sheet',          label: 'Sync Google Sheet',          risk: 'medium', desc: 'Sync VeRO brands from Google Sheet'     },
    { key: 'approve_report',      label: 'Approve / reject reports',   risk: 'high',   desc: 'Handle VeRO violation reports'          },
    { key: 'remove_brand',        label: 'Remove brand',               risk: 'high',   desc: 'Remove brands from VeRO database'       },
  ],
  infra_monitor: [
    { key: 'view_infra',          label: 'View infrastructure',        risk: 'low',    desc: 'See system status and components'       },
    { key: 'view_components',     label: 'View component health',      risk: 'low',    desc: 'See health status per system component' },
    { key: 'view_api_keys',       label: 'View B2B API keys',          risk: 'low',    desc: 'See all issued B2B API keys'            },
    { key: 'issue_key',           label: 'Issue new API key',          risk: 'high',   desc: 'Generate a new B2B partner API key'     },
    { key: 'toggle_key',          label: 'Toggle API key',             risk: 'high',   desc: 'Enable or disable a B2B API key'        },
    { key: 'delete_key',          label: 'Delete API key',             risk: 'high',   desc: 'Permanently remove a B2B API key'       },
    { key: 'update_status',       label: 'Update system status',       risk: 'high',   desc: 'Change public system status page'       },
    { key: 'manage_keys',         label: 'Manage all API keys',        risk: 'high',   desc: 'Full access to issue/toggle/delete keys'},
  ],
  competitor_xray: [
    { key: 'view_xray',           label: 'View competitor data',       risk: 'low',    desc: 'See competitor analysis results'        },
    { key: 'run_scan',            label: 'Run competitor scan',        risk: 'low',    desc: 'Trigger new competitor analysis'        },
    { key: 'view_history',        label: 'View scan history',          risk: 'low',    desc: 'See past competitor scan results'       },
    { key: 'export_data',         label: 'Export competitor data',     risk: 'low',    desc: 'Download competitor analysis as CSV'    },
  ],
  chrome_extension: [
    { key: 'view_extension',      label: 'View extension settings',    risk: 'low',    desc: 'See extension configuration'            },
    { key: 'edit_message',        label: 'Edit notification message',  risk: 'medium', desc: 'Edit the in-extension notification text'},
    { key: 'save_selectors',      label: 'Save CSS selectors',         risk: 'medium', desc: 'Update CSS selectors config for scraper'},
    { key: 'toggle_live',         label: 'Toggle extension live',      risk: 'high',   desc: 'Enable or disable the extension'        },
    { key: 'force_sync',          label: 'Force sync',                 risk: 'medium', desc: 'Force sync extension data'              },
    { key: 'push_ota',            label: 'Push OTA update',            risk: 'high',   desc: 'Push updates to all extension users'    },
    { key: 'view_ota_history',    label: 'View OTA history',           risk: 'low',    desc: 'See past OTA update records'            },
    { key: 'send_broadcast',      label: 'Send broadcast message',     risk: 'medium', desc: 'Send messages to all extension users'   },
    { key: 'view_broadcast_history', label: 'View broadcast history',  risk: 'low',    desc: 'See past broadcast messages sent'       },
  ],
}