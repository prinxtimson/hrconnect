const SentimentCard = ({ result, onDelete }) => {
    const getBadgeColor = (sentiment) => {
        switch (sentiment) {
            case "Positive":
                return "bg-green-100 text-green-700 border-green-200";
            case "Negative":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getEmoji = (sentiment) => {
        switch (sentiment) {
            case "Positive":
                return "😊";
            case "Negative":
                return "😞";
            default:
                return "😐";
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md relative group">
            {/* <button
                onClick={() => onDelete(result.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <i className="fas fa-trash-alt"></i>
            </button> */}

            <div className="flex items-start gap-4">
                <div className="text-3xl">{getEmoji(result.sentiment)}</div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeColor(
                                result.sentiment
                            )}`}
                        >
                            {result.sentiment}
                        </span>
                        <span className="text-xs text-slate-400">
                            {Math.round(result.confidence * 100)}% confidence
                        </span>
                    </div>

                    <p className="text-slate-700 text-sm mb-4 leading-relaxed italic">
                        "{result.original_text}"
                    </p>

                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                            AI Summary
                        </h4>
                        <p className="text-sm text-slate-600">
                            {result.summary}
                        </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {result.emotions.map((emotion, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-medium uppercase tracking-tight"
                            >
                                {emotion}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 text-[10px] text-slate-400 flex justify-between">
                <span>{new Date(result.created_at).toLocaleString()}</span>
                <span>ID: {result.id}</span>
            </div>
        </div>
    );
};

export default SentimentCard;
