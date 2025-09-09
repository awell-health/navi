const Loading = ({ children, loading }: { children: React.ReactNode, loading: boolean }): React.ReactNode => {
  return (
    <>
      <div className="flex justify-center items-center">
        {loading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mt-8" />}
      </div>
      {!loading && children}
    </>
  );
};

export default Loading;