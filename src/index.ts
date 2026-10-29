/**
 * @konopskidev/ui
 *
 * Every component is also importable on its own, e.g.
 * `import { Button } from '@konopskidev/ui/components/button'`,
 * which keeps a consumer bundle to what it actually uses.
 *
 * This barrel carries only what resolves with the core dependencies. A
 * component that needs a heavy, optional peer is deep-import only, so importing
 * `Button` from here never makes a bundler look for `recharts`. See the
 * "What each component needs" table in the README for the full mapping.
 */

export * from './components/ui/accordion';
export * from './components/ui/alert';
export * from './components/ui/alert-dialog';
export * from './components/ui/aspect-ratio';
export * from './components/ui/attachment';
export * from './components/ui/avatar';
export * from './components/ui/badge';
export * from './components/ui/breadcrumb';
export * from './components/ui/bubble';
export * from './components/ui/button';
export * from './components/ui/button-group';
export * from './components/ui/card';
export * from './components/ui/checkbox';
export * from './components/ui/code-block';
export * from './components/ui/collapsible';
export * from './components/ui/context-menu';
export * from './components/ui/dialog';
export * from './components/ui/direction';
export * from './components/ui/dropdown-menu';
export * from './components/ui/empty';
export * from './components/ui/field';
export * from './components/ui/hover-card';
export * from './components/ui/input';
export * from './components/ui/input-group';
export * from './components/ui/item';
export * from './components/ui/kbd';
export * from './components/ui/label';
export * from './components/ui/marker';
export * from './components/ui/menubar';
export * from './components/ui/message';
export * from './components/ui/native-select';
export * from './components/ui/navigation-menu';
export * from './components/ui/pagination';
export * from './components/ui/popover';
export * from './components/ui/progress';
export * from './components/ui/radio-group';
export * from './components/ui/scroll-area';
export * from './components/ui/select';
export * from './components/ui/separator';
export * from './components/ui/sheet';
export * from './components/ui/sidebar';
export * from './components/ui/skeleton';
export * from './components/ui/slider';
export * from './components/ui/spinner';
export * from './components/ui/switch';
export * from './components/ui/table';
export * from './components/ui/tabs';
export * from './components/ui/textarea';
export * from './components/ui/toggle';
export * from './components/ui/toggle-group';
export * from './components/ui/tooltip';
export * from './components/ui/trace';

export * from './lib/utils';
export * from './lib/get-placeholder';
export * from './hooks/use-mobile';
