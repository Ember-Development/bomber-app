import { StyleSheet } from 'react-native';
import { GlobalColors } from '@/constants/Colors';

export const styles = StyleSheet.create({
  floatingTabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 28,
    padding: 6,
    marginTop: 12,
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  tabText: {
    fontSize: 14,
    color: '#bbb',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  teamTabRow: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 16,
  },
  teamTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: GlobalColors.bomber,
  },
  tableSection: {
    marginBottom: 24,
  },
  teamTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
    marginTop: 10,
  },
  backLink: {
    fontSize: 13,
    color: '#ccc',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  rowLarge: {
    flexDirection: 'column',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    marginTop: 14,
  },
  rowContent: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  cellLarge: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  action: {
    color: GlobalColors.bomber,
    fontSize: 13,
    fontWeight: '600',
  },
  actionDelete: {
    color: '#ff8080',
    fontSize: 13,
    fontWeight: '600',
  },
  empty: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  teamLabel: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginVertical: 8,
  },

  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
