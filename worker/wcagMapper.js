const wcagMap = {
    "color-contrast": {
        title: "Insufficient Color Contrast",
        wcag: "1.4.3 Contrast (Minimum)",
        level: "AA",
        severity: "Serious",
        recommendation:
            "Increase foreground/background contrast to at least 4.5:1 for normal text and 3:1 for large text."
    },

    "button-name": {
        title: "Button Missing Accessible Name",
        wcag: "4.1.2 Name, Role, Value",
        level: "A",
        severity: "Critical",
        recommendation:
            "Add visible button text, an aria-label, or an aria-labelledby reference so screen readers can identify the button."
    },

    "heading-order": {
        title: "Incorrect Heading Order",
        wcag: "1.3.1 Info and Relationships",
        level: "A",
        severity: "Moderate",
        recommendation:
            "Adjust heading levels so they follow a logical order without skipping levels."
    },

    "frame-title": {
        title: "Frame Missing Title",
        wcag: "4.1.2 Name, Role, Value",
        level: "A",
        severity: "Serious",
        recommendation:
            "Add a descriptive title attribute to each iframe so assistive technologies can identify its purpose."
    },

    "region": {
        title: "Content Not Contained by Landmarks",
        wcag: "1.3.1 Info and Relationships",
        level: "A",
        severity: "Moderate",
        recommendation:
            "Wrap major page sections in semantic landmarks such as header, nav, main, aside, and footer."
    }
};

function mapWcagIssue(issue) {
    return {
        ...issue,
        ...(wcagMap[issue.id] || {
            title: issue.id,
            wcag: "Unmapped",
            level: "Unknown",
            severity: issue.impact || "Unknown",
            recommendation:
                "Review this issue manually and map it to the appropriate WCAG success criterion."
        })
    };
}

module.exports = mapWcagIssue;