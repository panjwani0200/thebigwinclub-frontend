export default function CasinoFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="casino-footer">
      &copy; {year} BigWinClub. All Rights Reserved.
    </footer>
  );
}
