# Mobile Perf Auditor — Agent Memory
Last updated: 2026-04-13

## Audit Status
- Initial audit: COMPLETE (2026-04-13)
- All critical and medium findings: IMPLEMENTED
- Tests: 150/150 passing after all fixes

## Key Patterns Established
- TransferCard: React.memo + useCallback for all handlers
- TransferCardGrid: useMemo for sections, stable renderItem/renderSectionHeader callbacks, SectionList perf props
- Bottom sheet style objects: always extract to module-scope constants (SHEET_BG_STYLE, SHEET_HANDLE_STYLE, CONTENT_CONTAINER_STYLE)
- useCrudList: queryParams wrapped in useMemo([filters, page, limit])
- Tabs screenOptions: useMemo keyed on isDark
- GestureHandlerRootView: StyleSheet.create at module scope
- Router navigation: always in useEffect, never in render body

## SectionList Standard Props (required on all SectionList/FlatList)
removeClippedSubviews={true}
maxToRenderPerBatch={8}
initialNumToRender={10}
windowSize={5}

## Files Audited
app/_layout.tsx, app/(auth)/login.tsx, app/(app)/_layout.tsx,
app/(app)/(tabs)/_layout.tsx, app/(app)/(tabs)/in-transit.tsx,
app/(app)/(tabs)/profile.tsx, src/contexts/AuthContext.tsx,
src/hooks/useCrudList.ts, src/hooks/queries.ts, src/lib/axios.ts,
src/lib/supabase.ts, src/lib/queryKeys.ts,
src/components/transfers/TransferCard.tsx,
src/components/transfers/TransferCardGrid.tsx,
src/components/transfers/TransferDetailSheet.tsx,
src/components/transfers/TransferReceiveSheet.tsx,
src/components/ui/StatusChip.tsx, src/components/ui/EmptyState.tsx,
src/components/ui/FilterSheet.tsx, src/theme/colors.ts,
src/config/constants.ts, src/services/transfers.service.ts,
src/services/stores.service.ts, package.json
