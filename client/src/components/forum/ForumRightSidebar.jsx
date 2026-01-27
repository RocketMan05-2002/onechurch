import { useForumContext } from "../../context/ForumContext";

export default function ForumRightSidebar() {
  const { trending } = useForumContext();

  const topics = [
    "Devotionals",
    "Testimonies",
    "Sermons",
    "Bible Study",
    "Community",
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Trending */}
      <div className="bg-gray-100 rounded-md p-4 m-2 dark:bg-gray-800">
        <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">
          Thinking about these?
        </h2>
        {trending && trending.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {trending.map((item) => (
              <li
                key={item.tag}
                className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded transition"
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {item.tag}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.count} posts
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">No trending topics yet.</div>
        )}
      </div>

      {/* Topics */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 m-2">
        <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">
          Topics
        </h2>
        <ul className="flex flex-col gap-2">
          {topics.map((topic) => (
            <li
              key={topic}
              className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition font-medium"
            >
              {topic}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
