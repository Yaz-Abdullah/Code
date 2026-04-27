"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { QuestionSuggestion } from "@/types";

interface Props {
  title: string;
  content: string;
  tags: string[];
  onApplyTitle: (value: string) => void;
  onApplyTags: (values: string[]) => void;
  maxTags?: number;
}

const MIN_TITLE_LENGTH = 8;
const MIN_CONTENT_LENGTH = 40;
const DEBOUNCE_MS = 800;

function normalizeTags(tags: string[]) {
  return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
}

const QuestionSuggestions = ({
  title,
  content,
  tags,
  onApplyTitle,
  onApplyTags,
  maxTags = 3,
}: Props) => {
  const [suggestion, setSuggestion] = useState<QuestionSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedTags = useMemo(() => normalizeTags(tags), [tags]);
  const canAskForHelp = title.trim().length >= MIN_TITLE_LENGTH || content.replace(/<[^>]+>/g, " ").trim().length >= MIN_CONTENT_LENGTH;

  useEffect(() => {
    const controller = new AbortController();

    if (!canAskForHelp) {
      setSuggestion(null);
      setError(null);
      setLoading(false);
      return () => controller.abort();
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/question-suggestions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            title,
            content,
            tags: normalizedTags,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message || "Failed to generate suggestions");
        }

        setSuggestion(result.data);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setError(err?.message || "Suggestion request failed");
          setSuggestion(null);
        }
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [title, content, normalizedTags, canAskForHelp]);

  const remainingTagSlots = Math.max(0, maxTags - normalizedTags.length);
  const tagsToAdd = suggestion?.suggestedTags
    ? suggestion.suggestedTags.filter((tag) => !normalizedTags.includes(tag)).slice(0, remainingTagSlots)
    : [];

  if (!canAskForHelp && !loading && !suggestion && !error) {
    return (
      <div className="light-border background-light900_dark300 rounded-xl border p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-500" />
          <p className="paragraph-semibold text-dark200_light900">AI Suggestions</p>
        </div>
        <p className="body-regular text-dark500_light500 mt-3">
          Start typing a title or explanation and I&apos;ll suggest a clearer title, missing details, and useful tags.
        </p>
      </div>
    );
  }

  return (
    <div className="light-border background-light900_dark300 rounded-xl border p-5 shadow-light-100 dark:shadow-none">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-500" />
          <p className="paragraph-semibold text-dark200_light900">AI Suggestions</p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-light-500">
            <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
            Thinking
          </div>
        )}
      </div>

      {error && !suggestion && (
        <p className="body-regular text-red-500 mt-3">{error}</p>
      )}

      {suggestion && (
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="small-medium uppercase tracking-wide text-light-500">Better title</p>
              <span className="rounded-full bg-light-800 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-light-500 dark:bg-dark-400">
                {suggestion.confidence} confidence
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="body-medium text-dark200_light900 rounded-lg bg-light-800 px-3 py-2 dark:bg-dark-400">
                {suggestion.suggestedTitle}
              </p>
              <Button
                type="button"
                onClick={() => onApplyTitle(suggestion.suggestedTitle)}
                className="h-8 rounded-md bg-primary-100 px-3 text-xs text-primary-500 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/20"
              >
                Use title
              </Button>
            </div>
          </div>

          {suggestion.summary && (
            <div className="space-y-2">
              <p className="small-medium uppercase tracking-wide text-light-500">What the question is missing</p>
              <p className="body-regular text-dark400_light700 rounded-lg bg-light-800 px-3 py-2 dark:bg-dark-400">
                {suggestion.summary}
              </p>
            </div>
          )}

          {suggestion.missingDetails.length > 0 && (
            <div className="space-y-2">
              <p className="small-medium uppercase tracking-wide text-light-500">Missing details</p>
              <ul className="space-y-2">
                {suggestion.missingDetails.map((item) => (
                  <li key={item} className="body-regular text-dark300_light700 flex items-start gap-2">
                    <Check className="mt-1 h-4 w-4 flex-shrink-0 text-primary-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tagsToAdd.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="small-medium uppercase tracking-wide text-light-500">Suggested tags</p>
                <Button
                  type="button"
                  onClick={() => onApplyTags(tagsToAdd)}
                  className="h-8 rounded-md bg-primary-100 px-3 text-xs text-primary-500 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/20"
                >
                  Add tags
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tagsToAdd.map((tag) => (
                  <span
                    key={tag}
                    className="subtle-medium background-light800_dark300 text-dark300_light700 rounded-md px-3 py-1 capitalize"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {suggestion.searchQueries.length > 0 && (
            <div className="space-y-2">
              <p className="small-medium uppercase tracking-wide text-light-500">Search ideas</p>
              <div className="flex flex-wrap gap-2">
                {suggestion.searchQueries.map((query) => (
                  <span
                    key={query}
                    className="body-regular rounded-full bg-light-800 px-3 py-1 text-dark400_light700 dark:bg-dark-400"
                  >
                    {query}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && !suggestion && !error && canAskForHelp && (
        <p className="body-regular text-dark500_light500 mt-3">
          I&apos;m looking for a clearer title, missing context, and likely tags.
        </p>
      )}
    </div>
  );
};

export default QuestionSuggestions;
