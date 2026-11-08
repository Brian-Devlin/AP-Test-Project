import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buttonClasses } from "./Button";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";

describe("EmptyState", () => {
  it("renders the title and description as text on a glass panel", () => {
    const html = renderToStaticMarkup(<EmptyState title="No projects yet" description="<b>hi</b>" />);
    expect(html).toContain("No projects yet");
    expect(html).toContain("&lt;b&gt;hi&lt;/b&gt;");
    expect(html).toContain("glass");
  });
});

describe("LoadingState", () => {
  it("announces itself as a status", () => {
    const html = renderToStaticMarkup(<LoadingState />);
    expect(html).toContain('role="status"');
    expect(html).toContain("Loading");
  });
});

describe("ErrorState", () => {
  it("is an alert and shows a retry button only with onRetry", () => {
    expect(renderToStaticMarkup(<ErrorState />)).toContain('role="alert"');
    expect(renderToStaticMarkup(<ErrorState />)).not.toContain("Try again");
    expect(renderToStaticMarkup(<ErrorState onRetry={() => {}} />)).toContain("Try again");
  });
});

describe("buttonClasses", () => {
  it("uses token colors for each variant", () => {
    expect(buttonClasses("primary")).toContain("bg-ink");
    expect(buttonClasses("secondary")).toContain("bg-paper");
    expect(buttonClasses("ghost")).toContain("shadow-none");
  });
});
