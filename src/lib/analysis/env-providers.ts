export interface EnvProviderSuggestion {
  var: string;
  label: string;
  description: string;
  providers: Array<{ name: string; url: string; note?: string }>;
}

const ENV_PROVIDER_MAP: Array<{
  pattern: RegExp;
  suggestion: Omit<EnvProviderSuggestion, "var">;
}> = [
  {
    pattern: /DATABASE_URL|POSTGRES|POSTGRESQL|PGDATABASE/i,
    suggestion: {
      label: "PostgreSQL database",
      description: "A managed PostgreSQL connection string.",
      providers: [
        { name: "Neon", url: "https://neon.tech", note: "generous free tier, serverless Postgres" },
        { name: "Prisma Postgres", url: "https://www.prisma.io/postgres", note: "zero-config if already using Prisma ORM" },
        { name: "Supabase", url: "https://supabase.com", note: "Postgres + auth + storage" },
        { name: "Railway", url: "https://railway.app", note: "one-click Postgres, same project as your app" },
        { name: "PlanetScale", url: "https://planetscale.com", note: "MySQL-compatible, not Postgres" }
      ]
    }
  },
  {
    pattern: /MYSQL_URL|MYSQL_DATABASE|CLEARDB/i,
    suggestion: {
      label: "MySQL database",
      description: "A managed MySQL connection string.",
      providers: [
        { name: "PlanetScale", url: "https://planetscale.com", note: "MySQL-compatible, branching model" },
        { name: "Railway", url: "https://railway.app", note: "one-click MySQL" },
        { name: "Supabase", url: "https://supabase.com", note: "Postgres only, not MySQL" }
      ]
    }
  },
  {
    pattern: /REDIS_URL|REDIS_HOST|UPSTASH|KV_URL/i,
    suggestion: {
      label: "Redis / KV store",
      description: "A managed Redis or key-value store URL.",
      providers: [
        { name: "Upstash", url: "https://upstash.com", note: "serverless Redis, Vercel-native integration" },
        { name: "Railway", url: "https://railway.app", note: "one-click Redis plugin" },
        { name: "Render", url: "https://render.com", note: "managed Redis add-on" }
      ]
    }
  },
  {
    pattern: /MONGODB_URI|MONGO_URL/i,
    suggestion: {
      label: "MongoDB database",
      description: "A MongoDB Atlas connection string.",
      providers: [
        { name: "MongoDB Atlas", url: "https://www.mongodb.com/atlas", note: "official managed MongoDB, free M0 tier" },
        { name: "Railway", url: "https://railway.app", note: "one-click MongoDB" }
      ]
    }
  },
  {
    pattern: /S3_|AWS_S3|BUCKET_|STORAGE_URL|R2_|CLOUDFLARE_R2/i,
    suggestion: {
      label: "Object storage",
      description: "An S3-compatible object storage bucket.",
      providers: [
        { name: "Cloudflare R2", url: "https://developers.cloudflare.com/r2", note: "S3-compatible, no egress fees" },
        { name: "AWS S3", url: "https://aws.amazon.com/s3" },
        { name: "Backblaze B2", url: "https://www.backblaze.com/b2", note: "S3-compatible, cheaper egress" }
      ]
    }
  },
  {
    pattern: /SMTP_|EMAIL_|SENDGRID|RESEND_|MAILGUN|POSTMARK/i,
    suggestion: {
      label: "Email / SMTP",
      description: "A transactional email service API key or SMTP credentials.",
      providers: [
        { name: "Resend", url: "https://resend.com", note: "modern developer-first email API" },
        { name: "SendGrid", url: "https://sendgrid.com", note: "Twilio SendGrid, generous free tier" },
        { name: "Postmark", url: "https://postmarkapp.com", note: "best deliverability" }
      ]
    }
  },
  {
    pattern: /STRIPE_|PAYMENT_/i,
    suggestion: {
      label: "Payments",
      description: "A Stripe secret key for payment processing.",
      providers: [
        { name: "Stripe", url: "https://stripe.com", note: "get your key at dashboard.stripe.com/apikeys" }
      ]
    }
  }
];

export function getEnvProviderSuggestions(envVars: string[]): EnvProviderSuggestion[] {
  const seen = new Set<string>();
  const results: EnvProviderSuggestion[] = [];

  for (const envVar of envVars) {
    for (const { pattern, suggestion } of ENV_PROVIDER_MAP) {
      if (pattern.test(envVar) && !seen.has(suggestion.label)) {
        seen.add(suggestion.label);
        results.push({ var: envVar, ...suggestion });
      }
    }
  }

  return results;
}
