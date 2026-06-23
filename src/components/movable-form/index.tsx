// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { type SxProps, type Theme, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";

type Position = {
  x: number;
  y: number;
};

type InteractionState =
  | {
      mode: "drag";
      startX: number;
      startY: number;
      originX: number;
      originY: number;
    }
  | {
      mode: "resize-width";
      startX: number;
      originWidth: number;
    }
  | {
      mode: "resize-height";
      startY: number;
      originHeight: number;
    }
  | {
      mode: "resize-both";
      startX: number;
      startY: number;
      originWidth: number;
      originHeight: number;
    }
  | null;

type MovableFormProps = {
  children: React.ReactNode;
  panelId: string;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  initialPosition?: Position;
  isFullPage?: boolean;
  onFullPageChange?: React.Dispatch<boolean>;
  onClose?: () => void;
  showFullPageButton?: boolean;
  reservedLeft?: number;
  zIndex?: number;
  sx?: SxProps<Theme>;
};

const VIEWPORT_MARGIN = 12;
const STORAGE_PREFIX = "movable-form:v5:";
const FALLBACK_PANEL_HEIGHT = 500;
const NON_DRAGGABLE_SELECTOR = [
  "input",
  "textarea",
  "select",
  "button",
  "a",
  "label",
  "[role='button']",
  "[role='option']",
  "[role='menuitem']",
  "[contenteditable='true']",
  "[data-no-drag='true']",
  ".MuiInputBase-root",
  ".MuiButtonBase-root",
  ".MuiSelect-select",
  ".MuiAutocomplete-root",
].join(", ");

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getStorageKey = (panelId: string) => `${STORAGE_PREFIX}${panelId}`;
const FOCUS_EVENT = "movable-form:focus";
const ACTIVE_Z_INDEX_LIMIT = 1290;

const getDefaultPosition = (
  panelWidth: number,
  panelHeight: number
): Position => {
  const resolvedHeight =
    panelHeight > 0 ? panelHeight : FALLBACK_PANEL_HEIGHT;

  return {
    x: Math.max(VIEWPORT_MARGIN, window.innerWidth - panelWidth - 80),
    y: Math.max(
      VIEWPORT_MARGIN,
      Math.round((window.innerHeight - resolvedHeight) / 2)
    ),
  };
};

const isNonDraggableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest(NON_DRAGGABLE_SELECTOR));
};

export const MovableForm: React.FC<MovableFormProps> = ({
  children,
  panelId,
  initialWidth = 400,
  initialHeight,
  minWidth = 320,
  maxWidth = 900,
  minHeight = 280,
  maxHeight = 920,
  initialPosition,
  isFullPage: controlledFullPage,
  onFullPageChange,
  onClose,
  showFullPageButton = false,
  reservedLeft = VIEWPORT_MARGIN,
  zIndex = 1300,
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const panelRef = useRef<HTMLDivElement | null>(null);
  const interactionRef = useRef<InteractionState>(null);
  const [isActivePanel, setIsActivePanel] = useState(false);

  const resolvedMaxWidth = useMemo(() => {
    if (!isDesktop) return maxWidth;
    return Math.min(
      maxWidth,
      Math.max(minWidth, window.innerWidth - Math.max(VIEWPORT_MARGIN, reservedLeft) - VIEWPORT_MARGIN)
    );
  }, [isDesktop, maxWidth, minWidth, reservedLeft]);

  const resolvedMaxHeight = useMemo(() => {
    if (!isDesktop) return maxHeight;
    return Math.min(
      maxHeight,
      Math.max(minHeight, window.innerHeight - VIEWPORT_MARGIN * 2)
    );
  }, [isDesktop, maxHeight, minHeight]);

  const [width, setWidth] = useState<number>(
    clamp(initialWidth, minWidth, resolvedMaxWidth)
  );
  const [height, setHeight] = useState<number | null>(() => {
    if (typeof initialHeight !== "number") return null;
    return clamp(initialHeight, minHeight, resolvedMaxHeight);
  });
  const [position, setPosition] = useState<Position>(() =>
    initialPosition || { x: 0, y: 0 }
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFullPage, setIsFullPage] = useState(false);
  const resolvedIsFullPage =
    typeof controlledFullPage === "boolean" ? controlledFullPage : isFullPage;
  const setResolvedIsFullPage = (nextValue: boolean) => {
    if (typeof controlledFullPage !== "boolean") {
      setIsFullPage(nextValue);
    }
    onFullPageChange?.(nextValue);
  };

  const focusPanel = () => {
    window.dispatchEvent(
      new CustomEvent(FOCUS_EVENT, { detail: { panelId } })
    );
  };
  const shouldUseInlineActions = showFullPageButton;
  const windowButtonBaseSx: SxProps<Theme> = {
    minHeight: 30,
    px: 1.25,
    py: 0.25,
    borderRadius: 1.25,
    color: "text.secondary",
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(4px)",
    boxShadow: "none",
    textTransform: "none",
    fontWeight: 700,
    lineHeight: 1,
    cursor: "pointer",
    "&:hover": {
      color: "text.primary",
      backgroundColor: "action.hover",
      boxShadow: "none",
    },
  };
  const backButtonSx: SxProps<Theme> = {
    ...windowButtonBaseSx,
    position: "absolute",
    top: 10,
    zIndex: 4,
    left: 10,
  };
  const fullPageButtonSx: SxProps<Theme> = {
    ...windowButtonBaseSx,
    position: "absolute",
    top: 10,
    zIndex: 4,
    right: 10,
  };
  const inlineBackButtonSx: SxProps<Theme> = {
    ...windowButtonBaseSx,
    flexShrink: 0,
  };
  const backIconButtonSx: SxProps<Theme> = {
    ...backButtonSx,
    width: 34,
    minWidth: 34,
    height: 34,
    p: 0,
  };
  const inlineBackIconButtonSx: SxProps<Theme> = {
    ...inlineBackButtonSx,
    width: 34,
    minWidth: 34,
    height: 34,
    p: 0,
  };
  const inlineFullPageButtonSx: SxProps<Theme> = {
    ...windowButtonBaseSx,
    flexShrink: 0,
  };

  const clampPosition = (
    nextPosition: Position,
    nextWidth = width,
    nextHeight = height
  ): Position => {
    if (!isDesktop) return nextPosition;

    const panelHeight = panelRef.current?.offsetHeight ?? nextHeight ?? 0;
    const panelWidth = panelRef.current?.offsetWidth ?? nextWidth;
    const minX = Math.max(VIEWPORT_MARGIN, reservedLeft);
    const maxX = Math.max(
      minX,
      window.innerWidth - panelWidth - VIEWPORT_MARGIN
    );
    const maxY = Math.max(
      VIEWPORT_MARGIN,
      window.innerHeight - panelHeight - VIEWPORT_MARGIN
    );

    return {
      x: clamp(nextPosition.x, minX, maxX),
      y: clamp(nextPosition.y, VIEWPORT_MARGIN, maxY),
    };
  };

  useEffect(() => {
    const handleFocusEvent = (event: Event) => {
      const focusedPanelId = (event as CustomEvent)?.detail?.panelId;
      setIsActivePanel(focusedPanelId === panelId);
    };

    window.addEventListener(FOCUS_EVENT, handleFocusEvent);
    return () => window.removeEventListener(FOCUS_EVENT, handleFocusEvent);
  }, [panelId]);

  useEffect(() => {
    if (!isDesktop) {
      setIsInitialized(true);
      return;
    }

    const defaultWidth = clamp(initialWidth, minWidth, resolvedMaxWidth);
    let nextWidth = defaultWidth;
    const defaultHeight =
      typeof initialHeight === "number"
        ? clamp(initialHeight, minHeight, resolvedMaxHeight)
        : null;
    let nextHeight = defaultHeight;
    let nextPosition =
      initialPosition ||
      getDefaultPosition(
        defaultWidth,
        panelRef.current?.offsetHeight ?? defaultHeight ?? 0
      );

    const stored = localStorage.getItem(getStorageKey(panelId));
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          width?: number;
          height?: number;
          x?: number;
          y?: number;
        };
        if (typeof parsed.width === "number") {
          nextWidth = clamp(parsed.width, minWidth, resolvedMaxWidth);
        }
        if (typeof parsed.height === "number") {
          nextHeight = clamp(parsed.height, minHeight, resolvedMaxHeight);
        }
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          nextPosition = { x: parsed.x, y: parsed.y };
        }
      } catch {
        // Ignore invalid storage values and use defaults.
      }
    }

    setWidth(nextWidth);
    setHeight(nextHeight ?? null);
    setPosition(clampPosition(nextPosition, nextWidth, nextHeight));
    setIsInitialized(true);
  }, [
    isDesktop,
    initialHeight,
    initialPosition,
    initialWidth,
    maxHeight,
    minWidth,
    minHeight,
    panelId,
    reservedLeft,
    resolvedMaxHeight,
    resolvedMaxWidth,
  ]);

  useEffect(() => {
    if (!isDesktop || !isInitialized) return;

    localStorage.setItem(
      getStorageKey(panelId),
      JSON.stringify({ x: position.x, y: position.y, width, height })
    );
  }, [height, isDesktop, isInitialized, panelId, position.x, position.y, width]);

  useEffect(() => {
    if (!isDesktop) return;

    const handleMouseMove = (event: MouseEvent) => {
      const interaction = interactionRef.current;
      if (!interaction) return;

      if (interaction.mode === "drag") {
        const deltaX = event.clientX - interaction.startX;
        const deltaY = event.clientY - interaction.startY;

        setPosition(
          clampPosition({
            x: interaction.originX + deltaX,
            y: interaction.originY + deltaY,
          })
        );
      }

      if (interaction.mode === "resize-width") {
        const deltaX = event.clientX - interaction.startX;
        const nextWidth = clamp(
          interaction.originWidth + deltaX,
          minWidth,
          resolvedMaxWidth
        );
        setWidth(nextWidth);
        setPosition((prev) => clampPosition(prev, nextWidth, height));
      }

      if (interaction.mode === "resize-height") {
        const deltaY = event.clientY - interaction.startY;
        const nextHeight = clamp(
          interaction.originHeight + deltaY,
          minHeight,
          resolvedMaxHeight
        );
        setHeight(nextHeight);
        setPosition((prev) => clampPosition(prev, width, nextHeight));
      }

      if (interaction.mode === "resize-both") {
        const deltaX = event.clientX - interaction.startX;
        const deltaY = event.clientY - interaction.startY;
        const nextWidth = clamp(
          interaction.originWidth + deltaX,
          minWidth,
          resolvedMaxWidth
        );
        const nextHeight = clamp(
          interaction.originHeight + deltaY,
          minHeight,
          resolvedMaxHeight
        );

        setWidth(nextWidth);
        setHeight(nextHeight);
        setPosition((prev) => clampPosition(prev, nextWidth, nextHeight));
      }
    };

    const handleMouseUp = () => {
      interactionRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    height,
    isDesktop,
    minHeight,
    minWidth,
    resolvedMaxHeight,
    resolvedMaxWidth,
    reservedLeft,
    width,
  ]);

  const handleDragStart = (event: React.MouseEvent<HTMLElement>) => {
    focusPanel();
    if (!isDesktop) return;
    if (resolvedIsFullPage) return;
    if (event.button !== 0) return;
    if (isNonDraggableTarget(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    interactionRef.current = {
      mode: "drag",
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
  };

  const handleResizeStart = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop) return;
    if (resolvedIsFullPage) return;
    event.preventDefault();
    event.stopPropagation();
    interactionRef.current = {
      mode: "resize-width",
      startX: event.clientX,
      originWidth: width,
    };
  };

  const handleResizeHeightStart = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop) return;
    if (resolvedIsFullPage) return;
    event.preventDefault();
    event.stopPropagation();
    interactionRef.current = {
      mode: "resize-height",
      startY: event.clientY,
      originHeight: panelRef.current?.offsetHeight ?? height ?? minHeight,
    };
  };

  const handleResizeBothStart = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop) return;
    if (resolvedIsFullPage) return;
    event.preventDefault();
    event.stopPropagation();
    interactionRef.current = {
      mode: "resize-both",
      startX: event.clientX,
      startY: event.clientY,
      originWidth: width,
      originHeight: panelRef.current?.offsetHeight ?? height ?? minHeight,
    };
  };

  const actions = (
    <>
      {onClose && (
        <Tooltip title="Back">
          <IconButton
            aria-label="Back"
            data-no-drag="true"
            onClick={onClose}
            size="small"
            sx={
              shouldUseInlineActions
                ? inlineBackIconButtonSx
                : backIconButtonSx
            }
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {showFullPageButton && (
        <Button
          aria-label={isFullPage ? "Exit full page" : "Full page view"}
          data-no-drag="true"
          onClick={() => setResolvedIsFullPage(!resolvedIsFullPage)}
          size="small"
          startIcon={
            resolvedIsFullPage ? (
              <CloseFullscreenIcon fontSize="small" />
            ) : (
              <OpenInFullIcon fontSize="small" />
            )
          }
          sx={
            shouldUseInlineActions ? inlineFullPageButtonSx : fullPageButtonSx
          }
        >
          {resolvedIsFullPage ? "Exit" : "Full page"}
        </Button>
      )}
    </>
  );

  const inlineActions = shouldUseInlineActions ? (
    <div
      data-no-drag="true"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        padding: "10px 10px 6px",
        width: "100%",
      }}
    >
      {actions}
    </div>
  ) : null;

  if (!isDesktop) {
    return (
      <div style={{ position: "relative", width: "100%" }}>
        {inlineActions}
        {!shouldUseInlineActions && actions}
        {children}
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      onMouseDown={handleDragStart}
      style={{
        position: "fixed",
        left: resolvedIsFullPage ? Math.max(VIEWPORT_MARGIN, reservedLeft) : position.x,
        top: resolvedIsFullPage ? VIEWPORT_MARGIN : position.y,
        width: resolvedIsFullPage
          ? `calc(100vw - ${VIEWPORT_MARGIN * 2}px)`
          : width,
        maxWidth: resolvedIsFullPage
          ? `calc(100vw - ${Math.max(VIEWPORT_MARGIN, reservedLeft) + VIEWPORT_MARGIN}px)`
          : undefined,
        height: resolvedIsFullPage
          ? `calc(100dvh - ${VIEWPORT_MARGIN * 2}px)`
          : height ?? "auto",
        zIndex: isActivePanel
          ? Math.min(ACTIVE_Z_INDEX_LIMIT, zIndex + 80)
          : zIndex,
        cursor: resolvedIsFullPage ? "default" : "grab",
        visibility: isInitialized ? "visible" : "hidden",
        pointerEvents: isInitialized ? "auto" : "none",
      }}
    >
      {!shouldUseInlineActions && actions}

      <div
        style={{
          height: (height || resolvedIsFullPage) ? "100%" : "auto",
          overflow: (height || resolvedIsFullPage) ? "auto" : "visible",
          paddingRight: 2,
          paddingBottom: 2,
        }}
      >
        {inlineActions}
        {children}
      </div>

      {!resolvedIsFullPage && (
        <>
          <div
            onMouseDown={handleResizeStart}
            style={{
              position: "absolute",
              top: 0,
              right: -6,
              width: 12,
              height: "100%",
              cursor: "ew-resize",
              zIndex: 1,
            }}
          />

          <div
            onMouseDown={handleResizeHeightStart}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -6,
              height: 12,
              cursor: "ns-resize",
              zIndex: 1,
            }}
          />

          <div
            onMouseDown={handleResizeBothStart}
            style={{
              position: "absolute",
              right: -7,
              bottom: -7,
              width: 14,
              height: 14,
              borderRadius: 4,
              cursor: "nwse-resize",
              zIndex: 2,
              backgroundColor: "transparent",
              border: "none",
            }}
          />
        </>
      )}
    </div>
  );
};
