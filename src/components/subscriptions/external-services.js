'use server';

import { siteConfig } from '@/components/config';

export const SendWebhook = async (url, data) => {
  if (!url || !data) {
    return false;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response?.ok || false;
  } catch (error) {
    // console.warn('Error sending webhook:', error);
    return false;
  }
};

export const SendNtfy = async (ntfy, data) => {
  if (!ntfy?.enabled || !ntfy?.url || !data) {
    return false;
  }

  try {
    const response = await fetch(
      ntfy.url,
      {
        method: 'POST',
        headers: {
          'Icon': `${siteConfig.url}/icons/icon-192.png`,
          ...(ntfy?.token ? { 'Authorization': `Bearer ${ntfy.token}` } : {}),
        },
        body: JSON.stringify({
          topic: ntfy?.topic || 'wapy-dev',
          tags: ['Wapy.dev'],
          priority: 3,
          click: siteConfig.url,
          ...data,
        }),
      }
    );

    return response?.ok || false;
  } catch (error) {
    // console.warn('Error sending ntfy:', error);
    return false;
  }
};

export const SendDiscord = async (discord, data) => {
  if (!discord?.enabled || !discord?.url || !data) {
    return false;
  }

  const payload = {
    username: siteConfig.name,
    avatar_url: `${siteConfig.url}/icons/icon-192.png`,
    content: `💡 **${siteConfig.name} Subscription Reminder**`,
    embeds: [
      {
        title: data.title,
        description: data.message,
        color: 121256,
        thumbnail: {
          url: `${siteConfig.url}/icons/icon-192.png`,
        },
        provider: {
          name: 'Wapy.dev',
          url: siteConfig.url,
        },
        fields: [
          ...(data.markAsPaidUrl
            ? [{
            name: 'Done with the payment?',
            value: `[Click here to mark it paid ✅](${data.markAsPaidUrl})`,
            }]
            : []
          ),
          {
            name: 'View Details',
            value: `[Visit Dashboard 🔗](${siteConfig.url})`,
          },
        ],
        footer: {
          text: `Sent by ${siteConfig.name}`,
        }
      },
    ],
  };

  return SendWebhook(
    discord.url,
    payload
  );
};

export const SendSlack = async (slack, data) => {
  if (!slack?.enabled || !slack?.url || !data) {
    return false;
  }

  const url123 = 'https://www.wapy.dev'
  const payload = {
    text: `${siteConfig.name} Subscription Reminder\n${data.title}\n${data.message}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${siteConfig.name} Subscription Reminder 💡`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${data.title}*\n${data.message}`,
        },
        accessory: {
          type: 'image',
          image_url: `${url123}/icons/icon-192.png`,
          alt_text: siteConfig.name,
        },
      },
      {
        type: 'actions',
        elements: [
          ...(data.markAsPaidUrl
            ? [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '💰 Mark as Paid',
                  },
                  url: data.markAsPaidUrl,
                  style: 'primary',
                },
              ]
            : []),
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '🔗 Visit Dashboard',
            },
            url: url123,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Sent by *${siteConfig.name}*`,
          },
        ],
      },
    ],
  };

  return SendWebhook(slack.url, payload);
};
