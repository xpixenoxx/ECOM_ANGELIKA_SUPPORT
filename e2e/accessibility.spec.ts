import { test, expect, type Page } from '@playwright/test';
import path from 'path';

const AXE_SCRIPT_PATH = require.resolve('axe-core');

interface AxeRunResult {
  violations: Array<{
    id: string;
    impact?: string | null;
    description: string;
    nodes: Array<{ target: string[] }>;
  }>;
}

async function auditRouteWcag(page: Page, route: string) {
  await page.goto(route, { waitUntil: 'load' });
  await expect(page.locator('main')).toBeVisible();
  // Allow 300-500ms CSS/Framer Motion entrance opacity transitions to settle
  await page.waitForTimeout(700);
  await page.addScriptTag({ path: AXE_SCRIPT_PATH });

  const results = await page.evaluate(async () => {
    const axe = (window as unknown as {
      axe: {
        run: (
          context: Document,
          options: { runOnly: { type: string; values: string[] } }
        ) => Promise<AxeRunResult>;
      };
    }).axe;

    return axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'],
      },
    });
  });

  const blockingViolations = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  );

  if (blockingViolations.length > 0) {
    console.error(
      `[Axe ${route}] Blocking WCAG 2.2 AA violations:`,
      JSON.stringify(
        blockingViolations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          targets: v.nodes.slice(0, 3).map((n) => n.target),
        })),
        null,
        2
      )
    );
  }

  expect(blockingViolations).toEqual([]);
}

const AUDIT_ROUTES = ['/', '/shop', '/size-finder', '/contact', '/track-order', '/cart', '/login'];

test.describe('WCAG 2.2 AA Accessibility Audit', () => {
  for (const route of AUDIT_ROUTES) {
    test(`has no critical or serious WCAG 2.2 AA violations on ${route}`, async ({ page }) => {
      await auditRouteWcag(page, route);
    });
  }
});

// Verify AXE path resolves at module load so failures surface clearly
test.describe('Accessibility Tooling Verification', () => {
  test('axe-core bundle exists', () => {
    expect(path.basename(AXE_SCRIPT_PATH)).toContain('axe');
  });
});
