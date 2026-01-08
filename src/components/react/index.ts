// React island components for Astro
// Use with client:load directive in MDX files

export { default as ShinyText } from '../ShinyText';
export {
  AnimatedItem,
  AnimatedList,
  type AnimatedListItem,
} from './AnimatedList';
export { APIBody, APIEndpoint } from './APIEndpoint';
export { BillingCalculator } from './BillingCalculator';
export { ContentBreadcrumbs } from './Breadcrumbs';
export { Callout } from './Callout';
export { default as CardGrid } from './CardGrid';
export { CodeTabs, Snippet } from './CodeTabs';
export { CopyPageButton } from './CopyPageButton';
export { DotPattern } from './DotPattern';
export { LifecycleDiagram } from './LifecycleDiagram';
export { default as LinkCard } from './LinkCard';
export { Pagination } from './Pagination';
export { Param, ParamInline, ParamTable } from './ParamTable';
export { PricingRates } from './PricingRates';
export { SearchDialog } from './SearchDialog';
export { SearchDialogWrapper } from './SearchDialogWrapper';
export { StatusBadge, StatusCodes } from './StatusCodes';
export { ThemeSwitcher } from './ThemeSwitcher';

// API Documentation Components - Legacy
export {
  CodeSnippet,
  EndpointCard,
  EndpointHeader,
  MethodBadge,
  ParameterList,
  PropertyRow,
  ResponseExample,
  SnippetTabs,
  TypeReference,
  WebSocketBadge,
  type Parameter,
  type PropertyRowProps,
  type TypeField,
} from './api';

// API Documentation Components - Double-Pane Layout (Stainless Style)
export {
  CollapsibleSnippet,
  MethodHeader,
  MethodPage,
  MethodPageLeft,
  MethodPageRight,
  PropertyTree,
  SDKSelector,
  SnippetPanel,
  type CodeExample,
  type HttpMethod,
  type Property,
  type SDKLanguage,
} from './api';
