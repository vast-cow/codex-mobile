### Feature: Explicit folder browsing and selection

#### Prerequisites
- Start the current checkout with `pnpm run dev --host 127.0.0.1 --port 4173`.
- Have two accessible directories and a child folder; open the home route.

#### Steps
1. Open **Select folder**. Type another absolute path, then click the Current folder label.
2. Confirm blur sends no directory-list request and does not select a project.
3. Click **Browse**; confirm the list navigates to the typed directory.
4. Type another valid path and press Enter; confirm only the listing changes.
5. Click a child folder name to browse; click its separate **Select** button to select it.
6. Reopen the picker, type a valid path, and click the top **Select** button without browsing first.
7. Repeat in light/dark themes at 1440x1000, 375x812, and 768x1024.

#### Expected Results
- Browse/Enter navigate; Select commits the chosen path and closes the dialog.
- Blur does not trigger a request or change the selected project.
- The path has its own row, with readable controls and no horizontal overflow.
- Folder rows, input, and dialog have dark surfaces and readable text in dark theme.

#### Rollback/Cleanup
- Return to the original project. Leave the shared verification server on 4173 running.
